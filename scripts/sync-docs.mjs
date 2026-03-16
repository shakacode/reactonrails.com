import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const buildSubset = args.has("--subset");

const upstreamRoot = path.join(workspaceRoot, "content", "upstream");
const overridesRoot = path.join(workspaceRoot, "content", "overrides");
const fullDocsTarget = path.join(upstreamRoot, "docs");
const subsetDocsTarget = path.join(upstreamRoot, "docs-subset");
const docsOverridesSource = path.join(overridesRoot, "docs");

const subsetPaths = [
  "README.md",
  "oss/introduction.md",
  "oss/getting-started/quick-start.md",
  "oss/getting-started/tutorial.md",
  "oss/getting-started/installation-into-an-existing-rails-app.md",
  "oss/core-concepts/how-react-on-rails-works.md",
  "oss/core-concepts/react-server-rendering.md",
  "oss/api-reference/view-helpers-api.md",
  "oss/building-features/react-and-redux.md",
  "oss/deployment/README.md",
  "oss/upgrading/upgrading-react-on-rails.md",
  "pro/react-on-rails-pro.md",
  "pro/home-pro.md",
  "pro/node-renderer/basics.md",
  "pro/react-server-components/tutorial.md"
];

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function cloneRepo(repoUrl, ref) {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "react-on-rails-docs-"));
  try {
    execFileSync("git", ["clone", "--depth", "1", "--branch", ref, repoUrl, tmpDir], {
      stdio: "inherit"
    });
  } catch {
    execFileSync("git", ["clone", "--depth", "1", repoUrl, tmpDir], {
      stdio: "inherit"
    });
  }
  return tmpDir;
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

async function writeSubset(sourceDocsRoot, subsetRoot) {
  await fs.rm(subsetRoot, { recursive: true, force: true });
  await fs.mkdir(subsetRoot, { recursive: true });

  const missing = [];
  let copied = 0;

  for (const relativeFile of subsetPaths) {
    const sourceFile = path.join(sourceDocsRoot, relativeFile);
    if (!(await exists(sourceFile))) {
      missing.push(relativeFile);
      continue;
    }
    const targetFile = path.join(subsetRoot, relativeFile);
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.copyFile(sourceFile, targetFile);
    copied += 1;
  }

  return { copied, missing };
}

async function countFiles(rootDir) {
  let count = 0;
  await walkFiles(rootDir, async () => {
    count += 1;
  });
  return count;
}

async function main() {
  const configuredRepo = process.env.REACT_ON_RAILS_REPO;
  const localRepo = configuredRepo
    ? path.resolve(configuredRepo)
    : path.resolve(workspaceRoot, "../react_on_rails");
  const localDocs = path.join(localRepo, "docs");

  let sourceRepo = localRepo;
  let ephemeralClone = null;

  if (!(await exists(localDocs))) {
    const repoUrl =
      process.env.REACT_ON_RAILS_REPO_URL ?? "https://github.com/shakacode/react_on_rails.git";
    const ref = process.env.REACT_ON_RAILS_REF ?? "master";
    console.log(`Local source repo missing. Cloning ${repoUrl} (${ref})...`);
    ephemeralClone = cloneRepo(repoUrl, ref);
    sourceRepo = ephemeralClone;
  }

  const sourceDocsRoot = path.join(sourceRepo, "docs");

  await fs.rm(fullDocsTarget, { recursive: true, force: true });
  await fs.mkdir(path.dirname(fullDocsTarget), { recursive: true });
  await fs.cp(sourceDocsRoot, fullDocsTarget, { recursive: true });

  if (await exists(docsOverridesSource)) {
    await fs.cp(docsOverridesSource, fullDocsTarget, { recursive: true, force: true });
  }

  let subsetStats = null;
  if (buildSubset) {
    subsetStats = await writeSubset(fullDocsTarget, subsetDocsTarget);
  }

  const docsCount = await countFiles(fullDocsTarget);

  console.log(`Synced docs to ${fullDocsTarget}`);
  console.log(`File count: ${docsCount}`);
  if (await exists(docsOverridesSource)) {
    console.log(`Applied docs overrides from ${docsOverridesSource}`);
  }
  if (subsetStats) {
    console.log(`Subset: copied ${subsetStats.copied} docs to ${subsetDocsTarget}`);
    if (subsetStats.missing.length > 0) {
      console.log("Subset missing files:");
      for (const missingPath of subsetStats.missing) {
        console.log(`- ${missingPath}`);
      }
    }
  }

  if (ephemeralClone) {
    await fs.rm(ephemeralClone, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
