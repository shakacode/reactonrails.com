import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const workspaceRoot = path.resolve(path.dirname(__filename), "..");

async function withTempDir(callback) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sync-docs-test-"));
  try {
    return await callback(tmpDir);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function writeFakeUpstream(upstreamRoot) {
  await fs.mkdir(path.join(upstreamRoot, "docs"), { recursive: true });
  await fs.writeFile(
    path.join(upstreamRoot, "docs", "README.md"),
    "# React on Rails Docs\n",
    "utf8"
  );
  await fs.writeFile(path.join(upstreamRoot, "llms.txt"), "llms index\n", "utf8");
  await fs.writeFile(path.join(upstreamRoot, "llms-full.txt"), "oss full\n", "utf8");
  await fs.writeFile(path.join(upstreamRoot, "llms-full-pro.txt"), "pro full\n", "utf8");
  await fs.writeFile(path.join(upstreamRoot, "prompts.yml"), "schema_version: 1\n", "utf8");
}

test("sync docs stages prompts and root llms files for publishing", async () => {
  await withTempDir(async (tmpDir) => {
    const upstreamRoot = path.join(tmpDir, "react_on_rails");
    await writeFakeUpstream(upstreamRoot);

    const upstreamContent = path.join(workspaceRoot, "content", "upstream");
    await fs.rm(upstreamContent, { recursive: true, force: true });

    await execFileAsync(process.execPath, [path.join(workspaceRoot, "scripts", "sync-docs.mjs")], {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        REACT_ON_RAILS_REPO: upstreamRoot,
      },
    });

    assert.equal(
      await fs.readFile(path.join(upstreamContent, "static", "llms.txt"), "utf8"),
      "llms index\n"
    );
    assert.equal(
      await fs.readFile(path.join(upstreamContent, "static", "llms-full.txt"), "utf8"),
      "oss full\n"
    );
    assert.equal(
      await fs.readFile(path.join(upstreamContent, "static", "llms-full-pro.txt"), "utf8"),
      "pro full\n"
    );
    assert.equal(
      await fs.readFile(path.join(upstreamContent, "prompts.yml"), "utf8"),
      "schema_version: 1\n"
    );
  });
});
