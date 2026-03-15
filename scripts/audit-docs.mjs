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
const docsRoot = path.resolve(
  argValue("--docs-root") ?? path.join(workspaceRoot, "prototypes", "docusaurus", "docs")
);
const outputPath = path.resolve(
  argValue("--output") ?? path.join(workspaceRoot, "VALIDATION_REPORT_2026-03-15.md")
);

const semverPattern = /\b(\d+)\.(\d+)\.(\d+)\b/g;
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
const legacyTermPattern =
  /\b(webpacker|turbolinks 2|react-hot-loader|asset pipeline|rails 5\.0|react_on_rails\s+1[0-5]\.)\b/gi;
const react18Pattern = /react 18/gi;

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

function lineNumbersForPattern(lines, pattern) {
  const result = [];
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      result.push(index + 1);
    }
    pattern.lastIndex = 0;
  });
  return result;
}

function findVersionsBelowFloor(content, floorTuple) {
  const versions = [];
  let match;
  while ((match = semverPattern.exec(content)) !== null) {
    const tuple = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (compareVersionTuple(tuple, floorTuple) < 0) {
      versions.push(match[0]);
    }
  }
  return [...new Set(versions)];
}

function findSuspiciousLinks(content) {
  const issues = [];
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
  }
  return [...new Set(issues)];
}

function evaluatePage(relativePath, content) {
  const lines = content.split(/\r?\n/);
  const comments = [];

  const firstContentLine = lines.find((line) => line.trim().length > 0) ?? "";
  if (!firstContentLine.startsWith("# ")) {
    comments.push("Missing top-level `#` heading; normalize to a single H1.");
  }

  const isReleaseNotes = relativePath.includes("release-notes/");
  const lowVersions = isReleaseNotes ? [] : findVersionsBelowFloor(content, [16, 4, 0]);
  if (lowVersions.length > 0) {
    comments.push(
      `Mentions versions below 16.4.0 (${lowVersions.slice(0, 4).join(", ")}); verify these are intentionally historical.`
    );
  }

  const suspiciousLinks = findSuspiciousLinks(content);
  for (const issue of suspiciousLinks) {
    comments.push(issue);
  }

  const legacyMentions = (content.match(legacyTermPattern) ?? []).length;
  if (legacyMentions >= 3) {
    comments.push("Heavy legacy terminology detected; consider archiving or adding a legacy warning.");
  }

  const react18Mentions = lineNumbersForPattern(lines, react18Pattern);
  if (react18Mentions.length > 0 && !isReleaseNotes) {
    comments.push(
      `Mentions React 18 on line(s) ${react18Mentions.slice(0, 5).join(", ")}; confirm whether this should now say React 19.`
    );
  }

  const placeholderLines = lineNumbersForPattern(lines, /\b(blah blah|TODO|TBD|xxx)\b/i);
  if (placeholderLines.length > 0) {
    comments.push(`Placeholder text found on line(s) ${placeholderLines.join(", ")}.`);
  }

  if (lines.length > 450 && !relativePath.includes("release-notes/")) {
    comments.push("Long page (>450 lines); consider splitting for navigability.");
  }

  if (comments.length === 0) {
    comments.push("No blocking issues detected.");
  }

  return {
    relativePath: relativePath.split(path.sep).join("/"),
    route: safeRoute(relativePath.split(path.sep).join("/")),
    comments,
    hasFindings: comments[0] !== "No blocking issues detected."
  };
}

function buildReport(pages) {
  const total = pages.length;
  const flagged = pages.filter((page) => page.hasFindings).length;
  const clean = total - flagged;
  const generatedAt = new Date().toISOString();

  const summary = [
    `# Docs Validation Report`,
    ``,
    `Generated: ${generatedAt}`,
    `Docs root: \`${docsRoot}\``,
    `Pages scanned: ${total}`,
    `Pages with findings: ${flagged}`,
    `Pages clean: ${clean}`,
    ``,
    `## Page-by-page comments`,
    ``
  ];

  const body = pages
    .map((page) => {
      const lines = [`### ${page.relativePath}`, `Route: \`${page.route}\``];
      for (const comment of page.comments) {
        lines.push(`- ${comment}`);
      }
      lines.push("");
      return lines.join("\n");
    })
    .join("\n");

  return `${summary.join("\n")}\n${body}`;
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
  await fs.writeFile(outputPath, report, "utf8");
  console.log(`Wrote docs report: ${outputPath}`);
  console.log(`Pages scanned: ${pages.length}`);
  console.log(`Pages with findings: ${pages.filter((page) => page.hasFindings).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
