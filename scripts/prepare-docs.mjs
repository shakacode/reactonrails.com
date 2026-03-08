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

async function ensureExists(targetPath, message) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(message);
  }
}

async function prepareDocusaurus() {
  const siteRoot = path.join(workspaceRoot, "prototypes", "docusaurus");
  const docsRoot = path.join(siteRoot, "docs");
  await fs.rm(docsRoot, { recursive: true, force: true });
  await fs.cp(sourceDocs, docsRoot, { recursive: true });
  console.log(`Prepared docusaurus docs from ${sourceDocs}`);
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
