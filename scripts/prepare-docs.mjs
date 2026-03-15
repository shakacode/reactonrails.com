import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

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
  if (original.includes("Friendly evaluation policy")) {
    return;
  }

  const notice = `> **Friendly evaluation policy**\n> You can evaluate React on Rails Pro without a license.\n> If your organization is budget-constrained, email [justin@shakacode.com](mailto:justin@shakacode.com). We can provide free licenses in qualifying cases.\n\n`;
  const updated = original.replace(/^# React on Rails Pro\s*\n+/, `# React on Rails Pro\n\n${notice}`);

  if (updated !== original) {
    await fs.writeFile(proIntroPath, updated, "utf8");
  }
}

function docsHomeMarkdown() {
  return `# React on Rails Documentation

Welcome to the React on Rails docs.

- [Introduction](./introduction.md)
- [Quick Start](./getting-started/quick-start.md)
- [Installation](./getting-started/installation-into-an-existing-rails-app.md)
- [API Reference](./api-reference/view-helpers-api.md)
- [Pro Documentation](./pro/react-on-rails-pro.md)

React on Rails Pro is friendly to evaluate:
- You can try Pro without a license.
- If your organization is budget-constrained, contact us about free licenses.

For discussions and support, visit [GitHub Discussions](https://github.com/shakacode/react_on_rails/discussions).
`;
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
  await fs.writeFile(path.join(docsRoot, "README.md"), docsHomeMarkdown(), "utf8");

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
