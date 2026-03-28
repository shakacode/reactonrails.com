import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] ?? null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");
const dateStamp = new Date().toISOString().slice(0, 10);
const docsRoot = path.resolve(
  argValue("--docs-root") ?? path.join(workspaceRoot, "prototypes", "docusaurus", "docs")
);
const outputPath = path.resolve(
  argValue("--output") ?? path.join(workspaceRoot, `VALIDATION_REPORT_${dateStamp}.md`)
);
const failOn = argValue("--fail-on") ?? "none";

const severityRank = {
  info: 0,
  warn: 1,
  error: 2,
};

const semverPattern = /\b(\d+)\.(\d+)\.(\d+)\b/g;
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const legacyTermPattern =
  /\b(webpacker|turbolinks 2|react-hot-loader|asset pipeline|rails 5\.0|react_on_rails\s+1[0-5]\.)\b/gi;
const react18Pattern = /react 18/gi;
const placeholderPattern = /\b(blah blah|TODO|TBD|xxx)\b/i;
const reactOnRailsContextPattern =
  /\b(react[\s_-]?on[\s_-]?rails(?:[\s_-]?(?:pro|rsc))?|react_on_rails(?:_(?:pro|rsc))?|react-on-rails(?:-(?:pro|rsc))?)\b/i;

if (!["none", "info", "warn", "error"].includes(failOn)) {
  throw new Error(`Invalid --fail-on value: ${failOn}`);
}

function compareVersionTuple(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

function safeRoute(relativePath) {
  return `/docs/${relativePath.replace(/\.(md|mdx)$/i, "")}`;
}

async function walkFiles(dir, callback, relativePrefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = relativePrefix ? path.join(relativePrefix, entry.name) : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(abs, callback, rel);
      continue;
    }
    if (entry.isFile()) {
      await callback(abs, rel);
    }
  }
}

function createLineInfo(content) {
  const lines = content.split(/\r?\n/);
  const lineInfo = [];
  let inFence = false;
  let fenceMarker = null;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (fenceMatch) {
      const marker = {
        char: fenceMatch[1][0],
        length: fenceMatch[1].length,
      };

      lineInfo.push({text: line, inFence: true});

      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker.char === fenceMarker?.char && marker.length >= fenceMarker.length) {
        inFence = false;
        fenceMarker = null;
      }

      continue;
    }

    lineInfo.push({text: line, inFence});
  }

  return lineInfo;
}

function stripInlineCode(line) {
  return line.replace(/`[^`]+`/g, "");
}

function lineNumbersForPattern(lineInfo, pattern, options = {}) {
  const {includeFenced = false, transform = (line) => line} = options;
  const result = [];

  lineInfo.forEach(({text, inFence}, index) => {
    if (!includeFenced && inFence) {
      return;
    }

    const candidate = transform(text);
    if (pattern.test(candidate)) {
      result.push(index + 1);
    }
    pattern.lastIndex = 0;
  });

  return result;
}

function findVersionsBelowFloor(lineInfo, floorTuple) {
  const versions = [];

  for (const {text, inFence} of lineInfo) {
    if (inFence || !reactOnRailsContextPattern.test(text)) {
      continue;
    }

    let match;
    semverPattern.lastIndex = 0;
    while ((match = semverPattern.exec(text)) !== null) {
      const tuple = [Number(match[1]), Number(match[2]), Number(match[3])];
      if (compareVersionTuple(tuple, floorTuple) < 0) {
        versions.push(match[0]);
      }
    }
  }

  return [...new Set(versions)];
}

function findSuspiciousLinks(lineInfo) {
  const issues = [];
  const content = lineInfo
    .filter(({inFence}) => !inFence)
    .map(({text}) => text)
    .join("\n");

  let match;
  while ((match = markdownLinkPattern.exec(content)) !== null) {
    const target = match[1].trim();
    if (target.startsWith("#-")) {
      issues.push(`Anchor starts with '-' (${target}).`);
    }
    if (target.includes("docs/release-notes/")) {
      issues.push(`Likely broken relative path (${target}).`);
    }
    if (target.includes("www.shakacode.com/react-on-rails/docs/")) {
      issues.push(`Legacy docs domain link (${target}).`);
    }
    if (target.includes("www.shakacode.com/react-on-rails-pro/docs/")) {
      issues.push(`Legacy Pro docs domain link (${target}).`);
    }
    if (target.includes("pro.reactonrails.com")) {
      issues.push(`Dead pro subdomain link (${target}).`);
    }
  }

  return [...new Set(issues)];
}

function addFinding(findings, severity, message) {
  findings.push({severity, message});
}

function evaluatePage(relativePath, content) {
  const lineInfo = createLineInfo(content);
  const findings = [];
  const firstContentLine = lineInfo.find(({text}) => text.trim().length > 0)?.text ?? "";
  const isReleaseNotes = relativePath.includes("release-notes/");

  if (!firstContentLine.startsWith("# ")) {
    addFinding(findings, "warn", "Missing top-level `#` heading; normalize to a single H1.");
  }

  const lowVersions = isReleaseNotes ? [] : findVersionsBelowFloor(lineInfo, [16, 4, 0]);
  if (lowVersions.length > 0) {
    addFinding(
      findings,
      "info",
      `Mentions React on Rails versions below 16.4.0 (${lowVersions.slice(0, 4).join(", ")}); verify these are intentionally historical.`
    );
  }

  const suspiciousLinks = findSuspiciousLinks(lineInfo);
  for (const issue of suspiciousLinks) {
    addFinding(findings, "error", issue);
  }

  const proseContent = lineInfo
    .filter(({inFence}) => !inFence)
    .map(({text}) => text)
    .join("\n");
  const legacyMentions = (proseContent.match(legacyTermPattern) ?? []).length;
  if (legacyMentions >= 3) {
    addFinding(
      findings,
      "info",
      "Heavy legacy terminology detected; consider archiving or adding a legacy warning."
    );
  }

  const react18Mentions = lineNumbersForPattern(lineInfo, react18Pattern);
  if (react18Mentions.length > 0 && !isReleaseNotes) {
    addFinding(
      findings,
      "warn",
      `Mentions React 18 on line(s) ${react18Mentions.slice(0, 5).join(", ")}; confirm whether this should now say React 19.`
    );
  }

  const placeholderLines = lineNumbersForPattern(lineInfo, placeholderPattern, {
    transform: stripInlineCode,
  });
  if (placeholderLines.length > 0) {
    addFinding(
      findings,
      "error",
      `Placeholder text found on line(s) ${placeholderLines.join(", ")}.`
    );
  }

  if (lineInfo.length > 450 && !isReleaseNotes) {
    addFinding(findings, "info", "Long page (>450 lines); consider splitting for navigability.");
  }

  return {
    relativePath: relativePath.split(path.sep).join("/"),
    route: safeRoute(relativePath.split(path.sep).join("/")),
    findings,
  };
}

function findingSummary(pages) {
  const findings = pages.flatMap((page) => page.findings);
  const counts = {
    error: findings.filter((finding) => finding.severity === "error").length,
    warn: findings.filter((finding) => finding.severity === "warn").length,
    info: findings.filter((finding) => finding.severity === "info").length,
  };

  return {
    counts,
    pageCounts: {
      withFindings: pages.filter((page) => page.findings.length > 0).length,
      withErrors: pages.filter((page) => page.findings.some((finding) => finding.severity === "error")).length,
      withWarnings: pages.filter((page) => page.findings.some((finding) => finding.severity === "warn")).length,
      withInfo: pages.filter((page) => page.findings.some((finding) => finding.severity === "info")).length,
    },
  };
}

function buildReport(pages) {
  const total = pages.length;
  const clean = total - pages.filter((page) => page.findings.length > 0).length;
  const generatedAt = new Date().toISOString();
  const relativeDocsRoot = path.relative(workspaceRoot, docsRoot).split(path.sep).join("/") || ".";
  const summary = findingSummary(pages);

  const header = [
    "# Docs Validation Report",
    "",
    `Generated: ${generatedAt}`,
    `Docs root: \`${relativeDocsRoot}\``,
    `Pages scanned: ${total}`,
    `Pages with findings: ${summary.pageCounts.withFindings}`,
    `Pages clean: ${clean}`,
    `Pages with errors: ${summary.pageCounts.withErrors}`,
    `Pages with warnings: ${summary.pageCounts.withWarnings}`,
    `Pages with info: ${summary.pageCounts.withInfo}`,
    `Errors: ${summary.counts.error}`,
    `Warnings: ${summary.counts.warn}`,
    `Info: ${summary.counts.info}`,
    "",
    "## Page-by-page comments",
    "",
  ];

  const body = pages
    .map((page) => {
      const lines = [`### ${page.relativePath}`, `Route: \`${page.route}\``];
      if (page.findings.length === 0) {
        lines.push("- `[ok]` No findings detected.");
      } else {
        for (const finding of page.findings) {
          lines.push(`- \`[${finding.severity}]\` ${finding.message}`);
        }
      }
      lines.push("");
      return lines.join("\n");
    })
    .join("\n");

  return `${header.join("\n")}${body}`;
}

function shouldFailAudit(pages) {
  if (failOn === "none") {
    return false;
  }

  const threshold = severityRank[failOn];
  return pages.some((page) =>
    page.findings.some((finding) => severityRank[finding.severity] >= threshold)
  );
}

async function main() {
  const pages = [];

  await walkFiles(docsRoot, async (absolutePath, relativePath) => {
    if (!relativePath.endsWith(".md") && !relativePath.endsWith(".mdx")) {
      return;
    }
    const content = await fs.readFile(absolutePath, "utf8");
    pages.push(evaluatePage(relativePath, content));
  });

  pages.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const report = buildReport(pages);
  const summary = findingSummary(pages);
  await fs.writeFile(outputPath, report, "utf8");

  console.log(`Wrote docs report: ${outputPath}`);
  console.log(`Pages scanned: ${pages.length}`);
  console.log(`Pages with findings: ${summary.pageCounts.withFindings}`);
  console.log(`Pages with errors: ${summary.pageCounts.withErrors}`);
  console.log(`Pages with warnings: ${summary.pageCounts.withWarnings}`);
  console.log(`Pages with info: ${summary.pageCounts.withInfo}`);
  console.log(`Errors: ${summary.counts.error}`);
  console.log(`Warnings: ${summary.counts.warn}`);
  console.log(`Info: ${summary.counts.info}`);

  if (shouldFailAudit(pages)) {
    console.error(`Failing docs audit because ${failOn}+ findings were detected.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
