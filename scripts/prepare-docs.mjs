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

function upgradeGuide1640Section() {
  return `## Upgrading to v16.4.0 (from v16.3.x)

This release includes many generator, SSR, and RSC fixes. See the [CHANGELOG](https://github.com/shakacode/react_on_rails/blob/master/CHANGELOG.md) for the full list.

**Key actions required:**

1. **Pro users: Legacy license key file removed.** \`config/react_on_rails_pro_license.key\` is no longer read. Move your token to the \`REACT_ON_RAILS_PRO_LICENSE\` environment variable.
2. **Pro users: \`jwt >= 2.7\` now required.** If your Gemfile pins \`jwt\` to an older version (e.g., 2.2.x for OAuth compatibility), you must upgrade it before bundling \`react_on_rails_pro\` 16.4.0.
3. **Pro users: RSC payload template override.** If your app overrides \`custom_rsc_payload_template\`, make sure it resolves to a text or format-neutral template (e.g., \`.text.erb\`). HTML-only overrides will raise \`ActionView::MissingTemplate\`.
4. **Generator layout renamed.** Fresh installs now generate \`react_on_rails_default.html.erb\` instead of \`hello_world.html.erb\`. Existing apps are unaffected unless re-running the generator.
5. **Pro users: Review changed defaults** (see table below).

### Changed Pro Defaults in 16.4.0

If you relied on previous defaults without explicitly setting values, behavior will change after upgrading:

| Setting | Old default (3.x / 16.2.x) | New default (16.4.0) |
| ------- | --------------------------- | -------------------- |
| \`ssr_timeout\` | 20s | 5s |
| \`renderer_request_retry_limit\` | 3 | 5 |
| \`renderer_use_fallback_exec_js\` | \`false\` | \`true\` |

To preserve old behavior, explicitly set these values in \`config/initializers/react_on_rails_pro.rb\`.

### Pro Node Renderer: \`bundlePath\` → \`serverBundleCachePath\`

In your node renderer config file, rename \`bundlePath\` to \`serverBundleCachePath\`:

\`\`\`diff
- bundlePath: path.resolve(__dirname, '../.node-renderer-bundles'),
+ serverBundleCachePath: path.resolve(__dirname, '../.node-renderer-bundles'),
\`\`\`

### Pro users upgrading from 3.x: Version numbering

\`react_on_rails_pro\` jumped from version 3.3.x to 16.x.x to align with the core gem version. If you are on Pro 3.3.x, version 16.2.0 is your next upgrade target. See the [Pro Upgrade Guide](/docs/pro/updating) for the full migration path (package renames, import changes, license setup).

`;
}

function upgradeGuide1630Section() {
  return `## Upgrading to v16.3.0 (from v16.2.x)

This is a minor release. Update your gem and npm package versions, then run \`bundle install\` and your package manager's install command. See the [CHANGELOG](https://github.com/shakacode/react_on_rails/blob/master/CHANGELOG.md) for details.

**Key changes:**

1. **Simplified Shakapacker version handling.** Obsolete minimum version checks (6.5.1) were removed. The gemspec dependency \`shakapacker >= 6.0\` is now the only minimum version requirement.
2. **Pro users: License-optional model.** Pro now works without a license for evaluation, development, testing, and CI/CD. A paid license is only required for production deployments.
3. **Pro users: Multiple license plan types.** License validation now supports plan types beyond "paid" (startup, nonprofit, education, oss, partner).

`;
}

function proUpdatingVersionNote() {
  return `### Version Numbering: 3.x → 16.x

\`react_on_rails_pro\` was renumbered from 3.3.x to 16.x.x starting with version 16.2.0 to align with the core \`react_on_rails\` gem. This is the same product — the version numbers were aligned so that both gems share the same version. If you are on Pro 3.3.x, upgrade to 16.2.0 or later.

### Gemfile: Only \`react_on_rails_pro\` Needed

Since \`react_on_rails_pro\` declares \`react_on_rails\` as a dependency, you do not need a separate \`gem "react_on_rails"\` line in your Gemfile. Having both lines can cause confusion about which controls the version:

\`\`\`diff
- gem "react_on_rails", "16.4.0"
- source "https://rubygems.pkg.github.com/shakacode-tools" do
-   gem "react_on_rails_pro", "3.3.1"
- end
+ gem "react_on_rails_pro", "= 16.4.0"
\`\`\`

### \`.npmrc\` Cleanup

If you have an \`.npmrc\` with \`@shakacode-tools:registry=https://npm.pkg.github.com\`, remove it. The node renderer package is now on the public npm registry.

`;
}

function proUpdatingJwtNote() {
  return `#### JWT Dependency

\`react_on_rails_pro\` 16.4.0 requires \`jwt >= 2.7\`. If your Gemfile or other gems pin \`jwt\` to an older version (common with OAuth gems), you will see a \`Bundler::VersionConflict\`. Upgrade \`jwt\` first:

\`\`\`ruby
# Gemfile
gem "jwt", ">= 2.7"
\`\`\`

`;
}

function proUpdatingDefaultsAndRenames() {
  return `#### Changed Defaults

Several Pro configuration defaults changed between 3.3.x and 16.4.0. If you relied on previous defaults without explicitly setting values, behavior will change:

| Setting | Old default (3.x) | New default (16.4.0) |
| ------- | ------------------ | -------------------- |
| \`ssr_timeout\` | 20s | 5s |
| \`renderer_request_retry_limit\` | 3 | 5 |
| \`renderer_use_fallback_exec_js\` | \`false\` | \`true\` |

To preserve old behavior, explicitly set these values in \`config/initializers/react_on_rails_pro.rb\`.

#### Node Renderer Config: \`bundlePath\` → \`serverBundleCachePath\`

Rename \`bundlePath\` to \`serverBundleCachePath\` in your node renderer configuration file:

\`\`\`diff
- bundlePath: path.resolve(__dirname, '../.node-renderer-bundles'),
+ serverBundleCachePath: path.resolve(__dirname, '../.node-renderer-bundles'),
\`\`\`

`;
}

function proUpdatingNpmPackagesExplanation() {
  return `### Understanding the Two npm Packages

React on Rails Pro has two separate npm packages:

| Package | Purpose | When needed |
| ------- | ------- | ----------- |
| \`react-on-rails-pro\` | Client-side Pro features (immediate hydration, RSC, async loading) | **Always** — all Pro users need this |
| \`react-on-rails-pro-node-renderer\` | Server-side Node.js renderer | Only if using \`NodeRenderer\` for SSR |

**Important:** When using \`react-on-rails-pro\`, you must **not** also import from \`react-on-rails\`. The Pro package re-exports everything from core. Importing from both will raise a runtime error.

If you only use the Node Renderer for SSR and do not use RSC or immediate hydration features, you still need \`react-on-rails-pro\` — it is the client package that registers components. \`react-on-rails-pro-node-renderer\` is only the server-side renderer process.

`;
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

  // Inject v16.4.0 and v16.3.0 upgrade sections into the OSS upgrade guide
  await rewriteDoc(docsRoot, "upgrading/upgrading-react-on-rails.md", (content) => {
    const anchor = "## Upgrading to v16.2.x (from v16.1.x)";
    if (content.includes("## Upgrading to v16.4.0") || !content.includes(anchor)) {
      return content;
    }
    return content.replace(anchor, upgradeGuide1640Section() + upgradeGuide1630Section() + anchor);
  });

  // Enrich the Pro updating guide with missing migration context
  await rewriteDoc(docsRoot, "pro/updating.md", (content) => {
    let updated = content;

    // Add version numbering note after "Who This Guide is For" section
    if (!updated.includes("Version Numbering: 3.x")) {
      const guideForAnchor = "### What's Changing";
      if (updated.includes(guideForAnchor)) {
        updated = updated.replace(guideForAnchor, proUpdatingVersionNote() + guideForAnchor);
      }
    }

    // Add npm packages explanation before the current setup section
    if (!updated.includes("Understanding the Two npm Packages")) {
      const currentSetupAnchor = "### Your Current Setup (GitHub Packages)";
      if (updated.includes(currentSetupAnchor)) {
        updated = updated.replace(currentSetupAnchor, proUpdatingNpmPackagesExplanation() + currentSetupAnchor);
      }
    }

    // Add JWT dependency note and changed defaults before "Verify Migration"
    if (!updated.includes("JWT Dependency")) {
      const verifyAnchor = "### Verify Migration";
      if (updated.includes(verifyAnchor)) {
        updated = updated.replace(
          verifyAnchor,
          proUpdatingJwtNote() + proUpdatingDefaultsAndRenames() + verifyAnchor
        );
      }
    }

    return updated;
  });
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

function docsHomeMarkdown({ hasArchive }) {
  const archiveSection = hasArchive
    ? `
## Need older material?

- [Historical Reference](./archive/README.md)
- [GitHub Discussions](https://github.com/shakacode/react_on_rails/discussions)
`
    : `
## Need more help?

- [GitHub Discussions](https://github.com/shakacode/react_on_rails/discussions)
`;

  return `---
custom_edit_url: null
---

# Documentation Guide

React on Rails is one product with two tiers: open source for Rails + React integration, and Pro when you need higher SSR throughput, deeper RSC support, or maintainer-backed help.

## Choose the path that matches your app

### Starting a new Rails + React app

- [Create a new app](./getting-started/create-react-on-rails-app.md)
- [Quick Start](./getting-started/quick-start.md)

### Adding React to an existing Rails app

- [Install into an existing Rails app](./getting-started/installation-into-an-existing-rails-app.md)
- [Render your first component](./getting-started/using-react-on-rails.md)

### Already using React on Rails OSS?

- [Compare OSS and Pro](./getting-started/oss-vs-pro.md)
- [Upgrade to Pro](./pro/upgrading-to-pro.md)

### Evaluating Rails + React options

- [Examples and migration references](/examples)
- [Migrate from react-rails](./migrating/migrating-from-react-rails.md)

## Dive deeper when you need it

- [Introduction](./introduction.md)
- [Core Concepts](./core-concepts/how-react-on-rails-works.md)
- [API Reference](./api-reference/view-helpers-api.md)
- [Deployment and troubleshooting](./deployment/README.md)

## Friendly evaluation policy

- You can try React on Rails Pro without a license while evaluating.
- If your organization is budget-constrained, contact us about free licenses.

${archiveSection}`;
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
  const hasArchive = await archiveLegacyDocs(docsRoot);
  await fs.unlink(path.join(docsRoot, "upgrading", "changelog.md")).catch((error) => {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  });
  await fs.writeFile(path.join(docsRoot, "README.md"), docsHomeMarkdown({ hasArchive }), "utf8");

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
