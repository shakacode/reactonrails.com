import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

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

export const WORD_COUNT_TOO_SHORT = 300;
export const WORD_COUNT_TOO_LONG = 4000;
export const STALE_AFTER_DAYS = 90;

// Directories under <repo>/docs that are not site content.
const SKIPPED_TOP_LEVEL_DIRS = new Set(["superpowers", "assets", "images"]);

// Index-like pages are legitimately short; release notes are legitimately terse.
const SHORTNESS_EXEMPT_PATTERN = /(^|\/)(README|index)\.mdx?$|(^|\/)release-notes\//i;

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---/;
const MARKDOWN_LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export function extractFrontmatter(content) {
  const match = content.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { body: content, description: null, title: null };
  }
  const body = content.slice(match[0].length);
  const description = match[1].match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? null;
  const title = match[1].match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? null;
  return { body, description, title };
}

export function pageTitle(content) {
  const { body, title } = extractFrontmatter(content);
  if (title) {
    return title;
  }
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
}

export function countWords(content) {
  const { body } = extractFrontmatter(content);
  return body.split(/\s+/).filter(Boolean).length;
}

// Resolves a relative markdown link found in `fromRelPath` (both repo-relative,
// POSIX-style, under docs/) to the repo-relative path it points at, or null for
// external/absolute/anchor-only links.
export function resolveDocLink(fromRelPath, href) {
  if (!href || /^(https?:|mailto:|#|\/)/.test(href)) {
    return null;
  }
  const withoutAnchor = href.split("#")[0];
  if (!/\.(md|mdx)$/i.test(withoutAnchor)) {
    return null;
  }
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromRelPath), withoutAnchor)
  );
  return resolved.startsWith("..") ? null : resolved;
}

// The prepared site strips the leading `oss/` from doc IDs (see prepare-docs.mjs),
// so `oss/migrating/foo.md` appears in sidebars.ts as 'migrating/foo'.
export function sidebarIdCandidates(relPath) {
  const noExt = relPath.replace(/\.(md|mdx)$/i, "");
  const candidates = [noExt];
  if (noExt.startsWith("oss/")) {
    candidates.push(noExt.slice("oss/".length));
  }
  return candidates;
}

export function classifyPage(page, { now = Date.now() } = {}) {
  const flags = [];
  const exemptFromShortness = SHORTNESS_EXEMPT_PATTERN.test(page.path);
  if (page.words < WORD_COUNT_TOO_SHORT && !exemptFromShortness) {
    flags.push("tooShort");
  }
  if (page.words > WORD_COUNT_TOO_LONG) {
    flags.push("tooLong");
  }
  if (page.lastCommitDate) {
    const ageDays = (now - Date.parse(page.lastCommitDate)) / 86_400_000;
    if (ageDays > STALE_AFTER_DAYS) {
      flags.push("stale");
    }
  }
  if (page.inboundLinks === 0 && !page.inSidebar) {
    flags.push("orphan");
  }
  if (!page.hasDescription) {
    flags.push("missingDescription");
  }
  return flags;
}

async function walkMarkdownFiles(dir, relativePrefix = "") {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = relativePrefix ? path.posix.join(relativePrefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      if (!relativePrefix && SKIPPED_TOP_LEVEL_DIRS.has(entry.name)) {
        continue;
      }
      results.push(...(await walkMarkdownFiles(path.join(dir, entry.name), rel)));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(rel);
    }
  }
  return results;
}

// One `git log --name-only` pass over docs/; the first time a path appears is
// its most recent commit. Cheaper than one `git log` invocation per file.
async function lastCommitDates(repoRoot) {
  const { stdout } = await execFileAsync(
    "git",
    ["log", "--format=COMMIT %as", "--name-only", "--", "docs"],
    { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 }
  );
  const dates = new Map();
  let currentDate = null;
  for (const line of stdout.split("\n")) {
    if (line.startsWith("COMMIT ")) {
      currentDate = line.slice("COMMIT ".length).trim();
    } else if (line.trim() && currentDate && !dates.has(line.trim())) {
      dates.set(line.trim(), currentDate);
    }
  }
  return dates;
}

function markdownTable(rows, headers) {
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];
  for (const row of rows) {
    lines.push(`| ${row.join(" | ")} |`);
  }
  return lines.join("\n");
}

function summaryReport(pages) {
  const totalWords = pages.reduce((sum, p) => sum + p.words, 0);
  const sortedByWords = [...pages].sort((a, b) => a.words - b.words);
  const sortedByDate = [...pages]
    .filter((p) => p.lastCommitDate)
    .sort((a, b) => a.lastCommitDate.localeCompare(b.lastCommitDate));
  const flagCounts = {};
  for (const page of pages) {
    for (const flag of page.flags) {
      flagCounts[flag] = (flagCounts[flag] ?? 0) + 1;
    }
  }
  const median = sortedByWords[Math.floor(sortedByWords.length / 2)]?.words ?? 0;

  const pageRow = (p) => [
    `\`${p.path}\``,
    String(p.words),
    p.lastCommitDate ?? "?",
    String(p.inboundLinks),
    p.flags.join(", ") || "—",
  ];
  const headers = ["Page", "Words", "Last commit", "Inbound", "Flags"];

  return [
    `# Docs Inventory — ${dateStamp}`,
    "",
    `- Pages: **${pages.length}**, total words: **${totalWords.toLocaleString("en-US")}**, median: **${median}**`,
    `- Flags: ${
      Object.entries(flagCounts)
        .sort()
        .map(([flag, count]) => `${flag}: ${count}`)
        .join(", ") || "none"
    }`,
    "",
    "Inbound-link counts only cover relative markdown links between docs pages;",
    "absolute `/docs/...` URLs and links from site-owned pages are not counted.",
    "",
    "## Shortest pages (excluding index/release-note pages)",
    "",
    markdownTable(
      sortedByWords.filter((p) => !SHORTNESS_EXEMPT_PATTERN.test(p.path)).slice(0, 20).map(pageRow),
      headers
    ),
    "",
    "## Longest pages",
    "",
    markdownTable(sortedByWords.slice(-20).reverse().map(pageRow), headers),
    "",
    "## Least recently touched",
    "",
    markdownTable(sortedByDate.slice(0, 20).map(pageRow), headers),
    "",
    "## Orphans (no inbound doc links, not in sidebars.ts)",
    "",
    markdownTable(pages.filter((p) => p.flags.includes("orphan")).map(pageRow), headers),
    "",
  ].join("\n");
}

async function main() {
  const configuredRepo = process.env.REACT_ON_RAILS_REPO;
  const repoRoot = path.resolve(
    argValue("--repo") ?? configuredRepo ?? path.join(workspaceRoot, "../react_on_rails")
  );
  const docsRoot = path.resolve(argValue("--docs-root") ?? path.join(repoRoot, "docs"));
  const outputBase = path.resolve(
    argValue("--output") ?? path.join(workspaceRoot, `DOCS_INVENTORY_${dateStamp}.md`)
  );
  const failOn = argValue("--fail-on") ?? "none";
  const knownFlags = ["none", "tooShort", "tooLong", "stale", "orphan", "missingDescription"];
  if (!knownFlags.includes(failOn)) {
    throw new Error(`Invalid --fail-on value: ${failOn}. Expected one of ${knownFlags.join(", ")}`);
  }

  try {
    await fs.access(docsRoot);
  } catch {
    throw new Error(
      `Docs root not found at ${docsRoot}. Set REACT_ON_RAILS_REPO or pass --repo pointing at a react_on_rails checkout.`
    );
  }

  const relPaths = await walkMarkdownFiles(docsRoot);
  const contents = new Map();
  for (const rel of relPaths) {
    contents.set(rel, await fs.readFile(path.join(docsRoot, rel), "utf8"));
  }

  const inbound = new Map(relPaths.map((rel) => [rel, 0]));
  for (const [rel, content] of contents) {
    for (const match of content.matchAll(MARKDOWN_LINK_PATTERN)) {
      const target = resolveDocLink(rel, match[1]);
      if (target && target !== rel && inbound.has(target)) {
        inbound.set(target, inbound.get(target) + 1);
      }
    }
  }

  let dates = new Map();
  try {
    dates = await lastCommitDates(repoRoot);
  } catch {
    console.warn(`Warning: could not read git history from ${repoRoot}; last-commit dates omitted.`);
  }

  let sidebarSource = "";
  try {
    sidebarSource = await fs.readFile(
      path.join(workspaceRoot, "prototypes", "docusaurus", "sidebars.ts"),
      "utf8"
    );
  } catch {
    console.warn("Warning: sidebars.ts not found; sidebar presence omitted.");
  }

  const pages = relPaths.map((rel) => {
    const content = contents.get(rel);
    const { description } = extractFrontmatter(content);
    const page = {
      path: rel,
      title: pageTitle(content),
      words: countWords(content),
      headings: (content.match(/^#{1,4}\s/gm) ?? []).length,
      codeBlocks: Math.floor((content.match(/^```/gm) ?? []).length / 2),
      hasDescription: Boolean(description),
      lastCommitDate: dates.get(path.posix.join("docs", rel)) ?? null,
      inboundLinks: inbound.get(rel),
      inSidebar: sidebarIdCandidates(rel).some((id) => sidebarSource.includes(`'${id}'`)),
    };
    page.flags = classifyPage(page);
    return page;
  });
  pages.sort((a, b) => a.path.localeCompare(b.path));

  const jsonPath = outputBase.replace(/\.md$/, ".json");
  await fs.writeFile(jsonPath, `${JSON.stringify({ generatedAt: dateStamp, pages }, null, 2)}\n`);
  await fs.writeFile(outputBase, summaryReport(pages));
  console.log(`Inventory: ${pages.length} pages -> ${outputBase} and ${jsonPath}`);

  if (failOn !== "none") {
    const failing = pages.filter((p) => p.flags.includes(failOn));
    if (failing.length > 0) {
      console.error(`${failing.length} page(s) flagged '${failOn}':`);
      for (const p of failing) {
        console.error(`  - ${p.path}`);
      }
      process.exitCode = 1;
    }
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
