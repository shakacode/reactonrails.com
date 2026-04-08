import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const legacyDocsToArchive = [
  {
    source: "building-features/hmr-and-hot-reloading-with-the-webpack-dev-server.md",
    replacement: "building-features/process-managers.md",
    reason:
      "This guide is webpacker-era and includes obsolete package/version guidance (React on Rails 11.x, Node 12)."
  },
  {
    source: "building-features/rails-webpacker-react-integration-options.md",
    replacement: "getting-started/installation-into-an-existing-rails-app.md",
    reason:
      "This comparison page targets legacy integration stacks and React < 18 compatibility workarounds."
  },
  {
    source: "deployment/troubleshooting-when-using-webpacker.md",
    replacement: "deployment/troubleshooting.md",
    reason:
      "This page documents webpacker-3 / Rails-5 era troubleshooting and should be treated as historical reference."
  },
  {
    source: "misc/asset-pipeline.md",
    replacement: "getting-started/project-structure.md",
    reason: "This page is Sprockets-era migration guidance with limited value for modern setups."
  }
];

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] ?? null;
}

const target = argValue("--target");
const useSubset = process.argv.includes("--subset");
const sourceDocs = path.join(
  workspaceRoot,
  "content",
  "upstream",
  useSubset ? "docs-subset" : "docs"
);

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureExists(targetPath, message) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(message);
  }
}

async function copyDirectoryContents(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await fs.cp(sourcePath, targetPath, { recursive: true });
      continue;
    }
    await fs.copyFile(sourcePath, targetPath);
  }
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

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function stripMdExtension(relativePath) {
  return relativePath.replace(/\.(md|mdx)$/i, "");
}

function routeForDoc(relativePath) {
  return `/docs/${stripMdExtension(toPosix(relativePath))}`;
}

function resolveRelativeDocPath(currentRelativePath, rawTarget) {
  const sourceDir = path.posix.dirname(toPosix(currentRelativePath));
  return path.posix.normalize(path.posix.join(sourceDir, rawTarget));
}

function rewriteRelativeMarkdownLinksToAbsolute(markdown, sourceRelativePath) {
  return markdown.replace(/\]\(([^)]+)\)/g, (fullMatch, rawTargetWithMaybeTitle) => {
    const targetWithMaybeTitle = rawTargetWithMaybeTitle.trim();
    const targetOnlyMatch = targetWithMaybeTitle.match(/^([^\s]+)(\s+["'][^"']*["'])?$/);
    if (!targetOnlyMatch) {
      return fullMatch;
    }

    const target = targetOnlyMatch[1];
    const optionalTitle = targetOnlyMatch[2] ?? "";
    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("#") ||
      target.startsWith("/")
    ) {
      return fullMatch;
    }

    const [targetPathAndQuery, anchor = ""] = target.split("#");
    const [targetPath, query = ""] = targetPathAndQuery.split("?");
    const resolved = resolveRelativeDocPath(sourceRelativePath, targetPath);
    if (resolved.startsWith("..")) {
      return fullMatch;
    }

    const querySuffix = query ? `?${query}` : "";
    const anchorSuffix = anchor ? `#${anchor}` : "";
    const isMarkdownDoc = /\.(md|mdx)$/i.test(resolved);
    const absolutePath = isMarkdownDoc ? routeForDoc(resolved) : `/docs/${resolved}`;
    return `](${absolutePath}${querySuffix}${anchorSuffix}${optionalTitle})`;
  });
}

async function rewriteDoc(docsRoot, relativePath, transform) {
  const absolutePath = path.join(docsRoot, ...relativePath.split("/"));
  if (!(await exists(absolutePath))) {
    return false;
  }

  const original = await fs.readFile(absolutePath, "utf8");
  const updated = transform(original);
  if (updated !== original) {
    await fs.writeFile(absolutePath, updated, "utf8");
    return true;
  }

  return false;
}

async function rewriteDocsByPattern(docsRoot, replacements) {
  let rewrittenFiles = 0;

  await walkFiles(docsRoot, async (absoluteFile, relativeFile) => {
    if (!relativeFile.endsWith(".md") && !relativeFile.endsWith(".mdx")) {
      return;
    }

    const original = await fs.readFile(absoluteFile, "utf8");
    let updated = original;

    for (const replacement of replacements) {
      updated = updated.replace(replacement.pattern, replacement.replacement);
    }

    if (updated !== original) {
      await fs.writeFile(absoluteFile, updated, "utf8");
      rewrittenFiles += 1;
    }
  });

  return rewrittenFiles;
}

function extractTitle(markdown, fallbackTitle) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallbackTitle;
}

function legacyArchiveIndexMarkdown(indexRows) {
  const list = indexRows
    .map(
      (entry) =>
        `- [${entry.title}](${entry.link}) — ${entry.reason} Prefer [current guidance](${entry.replacementLink}).`
    )
    .join("\n");

  return `# Legacy Archive

These pages remain available as historical reference, but they are no longer recommended for new projects.

${list}
`;
}

function archiveRootMarkdown() {
  return `# Historical Reference

Older material is grouped here to keep the main docs focused on current React on Rails workflows.

- [Legacy Archive](./legacy/README.md)
`;
}

async function archiveLegacyDocs(docsRoot) {
  const archiveIndexRows = [];

  for (const entry of legacyDocsToArchive) {
    const sourcePath = path.join(docsRoot, ...entry.source.split("/"));
    if (!(await exists(sourcePath))) {
      continue;
    }

    const original = await fs.readFile(sourcePath, "utf8");
    const title = extractTitle(original, path.basename(entry.source, ".md"));
    const archiveRelative = path.posix.join("archive", "legacy", entry.source);
    const archivePath = path.join(docsRoot, ...archiveRelative.split("/"));
    await fs.mkdir(path.dirname(archivePath), { recursive: true });

    const archivedBody = rewriteRelativeMarkdownLinksToAbsolute(original, entry.source);
    const archiveWarning = `> [!WARNING]\n> Archived legacy content. Use current docs for active guidance.\n\n`;
    const archivedWithWarning = archivedBody.match(/^#\s+.+\n/m)
      ? archivedBody.replace(/^#\s+.+\n/m, (match) => `${match}\n${archiveWarning}`)
      : `# ${title}\n\n${archiveWarning}${archivedBody}`;
    await fs.writeFile(archivePath, archivedWithWarning, "utf8");

    const relativeArchiveLink = toPosix(path.relative(path.dirname(sourcePath), archivePath));
    const replacementRoute = routeForDoc(entry.replacement);
    const stub = `# ${title}\n\n> [!WARNING]\n> This page has moved to the [legacy archive](${relativeArchiveLink}).\n> ${entry.reason}\n> For current guidance, use [this page](${replacementRoute}).\n`;
    await fs.writeFile(sourcePath, stub, "utf8");

    archiveIndexRows.push({
      title,
      link: `./${entry.source}`,
      reason: entry.reason,
      replacementLink: replacementRoute
    });
  }

  if (archiveIndexRows.length === 0) {
    return false;
  }

  const archiveRoot = path.join(docsRoot, "archive");
  const legacyRoot = path.join(archiveRoot, "legacy");
  await fs.mkdir(legacyRoot, { recursive: true });
  await fs.writeFile(path.join(archiveRoot, "README.md"), archiveRootMarkdown(), "utf8");
  await fs.writeFile(
    path.join(legacyRoot, "README.md"),
    legacyArchiveIndexMarkdown(archiveIndexRows),
    "utf8"
  );
  return true;
}

async function fixKnownDocsIssues(docsRoot) {
  await rewriteDocsByPattern(docsRoot, [
    {
      pattern: /\]\(\.\.\/\.\.\/README\.md\)/g,
      replacement: "](/docs/)"
    }
  ]);

  await rewriteDoc(docsRoot, "api-reference/redux-store-api.md", (content) =>
    content.replace(
      "#important-redux-shared-store-caveat",
      "#redux-shared-store-caveat"
    )
  );

  await rewriteDoc(docsRoot, "building-features/process-managers.md", (content) =>
    content.replaceAll("./i18n.md#internationalization", "./i18n.md")
  );

  await rewriteDoc(docsRoot, "deployment/troubleshooting.md", (content) =>
    content
      .replace(/\(#-([^)]+)\)/g, "(#$1)")
      .replace(
        "## 🚨 Installation Issues",
        "## 🚨 Installation Issues {#installation-issues}"
      )
      .replace("## 🔧 Build Issues", "## 🔧 Build Issues {#build-issues}")
      .replace("## ⚡ Runtime Issues", "## ⚡ Runtime Issues {#runtime-issues}")
      .replace("## 🎨 CSS Modules Issues", "## 🎨 CSS Modules Issues {#css-modules-issues}")
      .replace(
        "## 🖥️ Server-Side Rendering Issues",
        "## 🖥️ Server-Side Rendering Issues {#server-side-rendering-issues}"
      )
      .replace("## 🐌 Performance Issues", "## 🐌 Performance Issues {#performance-issues}")
  );

  await rewriteDoc(docsRoot, "migrating/rsc-data-fetching.md", (content) =>
    content.replace(
      "See the [runtime validation example](#runtime-validation-for-server-actions) in the Troubleshooting guide.",
      "See the [runtime validation example](./rsc-troubleshooting.md#runtime-validation-for-server-actions) in the Troubleshooting guide."
    )
  );

  await rewriteDoc(docsRoot, "pro/caching.md", (content) =>
    content.replace(
      /\n# Confirming and Debugging Cache Keys\n/,
      "\n## Confirming and Debugging Cache Keys\n"
    )
  );

  await rewriteDoc(docsRoot, "configuration/README.md", (content) =>
    content.replace("docs/release-notes/16.0.0.md", "../upgrading/release-notes/16.0.0.md")
  );

  await rewriteDoc(docsRoot, "deployment/troubleshooting-when-using-shakapacker.md", (content) =>
    content.replace("React on Rails version: 13.3.5", "React on Rails version: 16.4.0")
  );

  await rewriteDoc(
    docsRoot,
    "building-features/how-to-use-different-files-for-client-and-server-rendering.md",
    (content) =>
      content.replace(
        /^## How to use different versions of a file for client and server rendering/m,
        "# How to use different versions of a file for client and server rendering"
      )
  );

  await rewriteDoc(docsRoot, "migrating/migrating-from-react-rails.md", (content) =>
    content.replace(/^## Migrate From react-rails/m, "# Migrate From react-rails")
  );

  await rewriteDoc(docsRoot, "pro/home-pro.md", (content) =>
    content
      .replace("Now supports React 18", "Now supports React 19")
      .replace(
        "### 🚀 Next-Gen Server Rendering: Streaming with React 18's Latest APIs",
        "### 🚀 Next-Gen Server Rendering: Streaming with React 19's Latest APIs"
      )
      .replace(
        "React on Rails Pro supports React 18's Streaming Server-Side Rendering",
        "React on Rails Pro supports React 19's Streaming Server-Side Rendering"
      )
  );

  await rewriteDoc(docsRoot, "pro/ruby-api.md", (content) =>
    content.replace("using React 18's `renderToPipeableStream`", "using React 19's `renderToPipeableStream`")
  );

  await rewriteDoc(docsRoot, "api-reference/view-helpers-api.md", (content) =>
    content.replace("using React 18+ streaming", "using React 19+ streaming")
  );

  const streamDocPaths = [
    "building-features/streaming-server-rendering.md",
    "pro/streaming-server-rendering.md"
  ];
  for (const streamPath of streamDocPaths) {
    await rewriteDoc(docsRoot, streamPath, (content) =>
      content
        .replace(
          "# 🚀 Streaming Server Rendering with React 18",
          "# 🚀 Streaming Server Rendering with React 19"
        )
        .replace(
          "React on Rails Pro supports streaming server rendering using React 18's latest APIs",
          "React on Rails Pro supports streaming server rendering using React 19's latest APIs"
        )
        .replace(
          "**⚠️ Important: Redux Shared Store Caveat**",
          "#### Redux Shared Store Caveat {#redux-shared-store-caveat}"
        )
        .replaceAll("React 18's Selective Hydration", "React 19's Selective Hydration")
    );
  }

  await rewriteDocsByPattern(docsRoot, [
    {
      pattern: /https:\/\/www\.shakacode\.com\/react-on-rails\/docs\//g,
      replacement: "https://reactonrails.com/docs/"
    },
    {
      pattern: /https:\/\/www\.shakacode\.com\/react-on-rails-pro\/docs\//g,
      replacement: "https://reactonrails.com/docs/pro/"
    }
  ]);
}

async function rewriteProLinks(proDocsRoot) {
  if (!(await exists(proDocsRoot))) {
    return;
  }

  await walkFiles(proDocsRoot, async (absoluteFile, relativeFile) => {
    if (!relativeFile.endsWith(".md") && !relativeFile.endsWith(".mdx")) {
      return;
    }
    const original = await fs.readFile(absoluteFile, "utf8");
    const updated = original
      .replace(/((?:\.\.\/)+)oss\//g, "$1")
      .replace(/https:\/\/www\.shakacode\.com\/react-on-rails\/docs\//g, "https://reactonrails.com/docs/")
      .replace(/https:\/\/www\.shakacode\.com\/react-on-rails-pro\/docs\//g, "https://reactonrails.com/docs/pro/");
    if (updated !== original) {
      await fs.writeFile(absoluteFile, updated, "utf8");
    }
  });
}

async function rewriteFlattenedOssLinks(docsRoot) {
  await walkFiles(docsRoot, async (absoluteFile, relativeFile) => {
    if (!relativeFile.endsWith(".md") && !relativeFile.endsWith(".mdx")) {
      return;
    }
    if (relativeFile.startsWith("pro/")) {
      return;
    }
    const original = await fs.readFile(absoluteFile, "utf8");
    const updated = original
      .replace(/\.\.\/\.\.\/pro\//g, "../pro/")
      .replace(/\.\.\/\.\.\/images\//g, "../images/")
      .replace(/\.\.\/\.\.\/\.\.\/assets\//g, "../../assets/")
      .replace(/https:\/\/www\.shakacode\.com\/react-on-rails\/docs\//g, "https://reactonrails.com/docs/")
      .replace(/https:\/\/www\.shakacode\.com\/react-on-rails-pro\/docs\//g, "https://reactonrails.com/docs/pro/");
    if (updated !== original) {
      await fs.writeFile(absoluteFile, updated, "utf8");
    }
  });
}

async function injectProFriendlyNotice(docsRoot) {
  const proIntroPath = path.join(docsRoot, "pro", "react-on-rails-pro.md");
  if (!(await exists(proIntroPath))) {
    return;
  }

  const original = await fs.readFile(proIntroPath, "utf8");
  let updated = original;

  // Inject slug so this doc serves at /docs/pro/ instead of /docs/pro/react-on-rails-pro
  if (!updated.includes("slug:")) {
    if (updated.startsWith("---")) {
      // Existing frontmatter — insert slug after opening ---
      updated = updated.replace(/^---\n/, "---\nslug: /pro\n");
    } else {
      // No frontmatter — add it
      updated = `---\nslug: /pro\n---\n\n${updated}`;
    }
  }

  if (!updated.includes("Friendly evaluation policy")) {
    const notice = `> **Friendly evaluation policy**\n> You can evaluate React on Rails Pro without a license.\n> If your organization is budget-constrained, email [justin@shakacode.com](mailto:justin@shakacode.com). We can provide free licenses in qualifying cases.\n\n`;
    updated = updated.replace(/^# React on Rails Pro\s*\n+/m, `# React on Rails Pro\n\n${notice}`);
  }

  if (updated !== original) {
    await fs.writeFile(proIntroPath, updated, "utf8");
  }
}

const languageRemapping = {
  rsc: "text",
  procfile: "yaml",
  Procfile: "yaml",
  "Procfile.dev": "yaml",
  gitignore: "ignore",
  JSON: "json"
};

function detectCodeLanguage(content) {
  const lines = content.split("\n");
  const firstLine = lines[0] || "";

  if (firstLine.startsWith("#!/")) return "bash";
  if (/^\$ /.test(firstLine)) return "bash";
  if (/^(yarn |npm |npx |bundle exec |rails |bin\/)/.test(firstLine)) return "bash";
  if (/^[A-Z_]+=\S+$/.test(firstLine.trim()) && lines.length <= 2) return "bash";

  if (/\b(const |let |var |require\(|module\.exports|import )/.test(content)) return "js";

  return "text";
}

function normalizeCodeFencesInMarkdown(markdown) {
  const lines = markdown.split("\n");
  let inBlock = false;
  let blockOpenIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inBlock && /^```\S/.test(line)) {
      const lang = line.slice(3).trim();
      if (languageRemapping[lang]) {
        lines[i] = `\`\`\`${languageRemapping[lang]}`;
      }
      inBlock = true;
      continue;
    }

    if (!inBlock && /^```\s*$/.test(line)) {
      blockOpenIdx = i;
      inBlock = true;
      continue;
    }

    if (inBlock && /^```\s*$/.test(line)) {
      if (blockOpenIdx >= 0) {
        const blockContent = lines.slice(blockOpenIdx + 1, i).join("\n");
        lines[blockOpenIdx] = `\`\`\`${detectCodeLanguage(blockContent)}`;
        blockOpenIdx = -1;
      }
      inBlock = false;
    }
  }

  return lines.join("\n");
}

async function normalizeCodeFences(docsRoot) {
  let filesUpdated = 0;

  await walkFiles(docsRoot, async (absoluteFile, relativeFile) => {
    if (!relativeFile.endsWith(".md") && !relativeFile.endsWith(".mdx")) {
      return;
    }

    const original = await fs.readFile(absoluteFile, "utf8");
    const updated = normalizeCodeFencesInMarkdown(original);
    if (updated !== original) {
      await fs.writeFile(absoluteFile, updated, "utf8");
      filesUpdated += 1;
    }
  });

  if (filesUpdated > 0) {
    console.log(`Normalized code fences in ${filesUpdated} files`);
  }
}

function docsHomeMarkdown(sourceMarkdown, { hasArchive }) {
  const archiveBlock = hasArchive ? "- [Historical Reference](./archive/README.md)\n" : "";

  const updated = sourceMarkdown
    .trim()
    .replaceAll("(./oss/", "(./")
    .replace("](https://reactonrails.com/examples)", "](/examples)")
    .replace(/\n- \[Documentation website\]\(https:\/\/reactonrails\.com\/docs\/\)\s*/g, "\n")
    .replace("## Need more help?\n\n", `## Need more help?\n\n${archiveBlock}`);

  return `---\ncustom_edit_url: null\n---\n\n${updated}\n`;
}

function archiveSidebarCategory() {
  const legacyItems = legacyDocsToArchive.map(
    (entry) => `            'archive/legacy/${stripMdExtension(entry.source)}',`
  );
  return `    {
      type: 'category',
      label: 'Historical Reference',
      link: {type: 'generated-index', title: 'Historical Reference'},
      items: [
        'archive/README',
        {
          type: 'category',
          label: 'Legacy Archive',
          items: [
            'archive/legacy/README',
${legacyItems.join("\n")}
          ],
        },
      ],
    },`;
}

async function prepareSidebars(siteRoot, hasArchive) {
  const upstreamSidebars = path.join(workspaceRoot, "content", "upstream", "sidebars.ts");
  const targetSidebars = path.join(siteRoot, "sidebars.ts");

  if (await exists(upstreamSidebars)) {
    let content = await fs.readFile(upstreamSidebars, "utf8");

    if (hasArchive) {
      // Insert archive category as the last item in docsSidebar before the closing ];
      const archiveCategory = archiveSidebarCategory();
      content = content.replace(
        /(\n  \],\n\};\n)/,
        `\n${archiveCategory}\n  ],\n};\n`
      );
    }

    await fs.writeFile(targetSidebars, content, "utf8");
    console.log("Generated sidebars.ts from upstream");
  } else {
    console.warn("Warning: upstream sidebars.ts not found — using committed fallback");
  }
}

async function prepareDocusaurus() {
  const siteRoot = path.join(workspaceRoot, "prototypes", "docusaurus");
  const docsRoot = path.join(siteRoot, "docs");
  const ossDocsRoot = path.join(sourceDocs, "oss");
  const proDocsRoot = path.join(sourceDocs, "pro");
  const sourceImagesRoot = path.join(sourceDocs, "images");
  const sourceAssetsRoot = path.join(sourceDocs, "assets");

  await ensureExists(
    ossDocsRoot,
    `Expected OSS docs at ${ossDocsRoot}. Check upstream docs layout before preparing.`
  );

  await fs.rm(docsRoot, { recursive: true, force: true });
  await fs.mkdir(docsRoot, { recursive: true });

  await copyDirectoryContents(ossDocsRoot, docsRoot);

  if (await exists(proDocsRoot)) {
    await fs.cp(proDocsRoot, path.join(docsRoot, "pro"), { recursive: true });
  }
  if (await exists(sourceImagesRoot)) {
    await fs.cp(sourceImagesRoot, path.join(docsRoot, "images"), { recursive: true });
  }
  if (await exists(sourceAssetsRoot)) {
    await fs.cp(sourceAssetsRoot, path.join(docsRoot, "assets"), { recursive: true });
  }

  await rewriteProLinks(path.join(docsRoot, "pro"));
  await rewriteFlattenedOssLinks(docsRoot);
  await injectProFriendlyNotice(docsRoot);
  await fixKnownDocsIssues(docsRoot);
  await normalizeCodeFences(docsRoot);
  const hasArchive = await archiveLegacyDocs(docsRoot);
  await fs.unlink(path.join(docsRoot, "upgrading", "changelog.md")).catch((error) => {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  });
  const docsHomeSource = await fs.readFile(path.join(sourceDocs, "README.md"), "utf8");
  await fs.writeFile(
    path.join(docsRoot, "README.md"),
    docsHomeMarkdown(docsHomeSource, { hasArchive }),
    "utf8"
  );

  await prepareSidebars(siteRoot, hasArchive);

  console.log(`Prepared docusaurus docs from ${sourceDocs} (oss -> root, pro -> /pro)`);
}

async function main() {
  if (target && target !== "docusaurus") {
    throw new Error("Only docusaurus is supported. Use --target docusaurus.");
  }

  await ensureExists(
    sourceDocs,
    `Source docs not found at ${sourceDocs}. Run \`npm run sync:docs\` first.`
  );

  await prepareDocusaurus();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
