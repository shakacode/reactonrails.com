import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  detectDocsLayout,
  docsLayoutPaths,
  excludeNamesForRootCopy,
  subsetPathsForLayout,
} from "./docs-layout.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesRoot = path.join(__dirname, "__fixtures__", "docs-layout");

test("detectDocsLayout returns split for oss/pro layout", async () => {
  const docsRoot = path.join(fixturesRoot, "split");
  const layout = await detectDocsLayout(docsRoot);
  assert.equal(layout, "split");

  const layoutPaths = docsLayoutPaths(docsRoot, layout);
  assert.equal(layoutPaths.contentRoot, path.join(docsRoot, "oss"));
  assert.equal(layoutPaths.proDocsRoot, path.join(docsRoot, "pro"));
});

test("detectDocsLayout returns consolidated for single-tree layout", async () => {
  const docsRoot = path.join(fixturesRoot, "consolidated");
  const layout = await detectDocsLayout(docsRoot);
  assert.equal(layout, "consolidated");

  const layoutPaths = docsLayoutPaths(docsRoot, layout);
  assert.equal(layoutPaths.contentRoot, docsRoot);
  assert.equal(layoutPaths.proDocsRoot, path.join(docsRoot, "pro"));
});

test("detectDocsLayout ignores stray oss directories without split markers", async () => {
  const docsRoot = path.join(fixturesRoot, "consolidated-with-oss");
  const layout = await detectDocsLayout(docsRoot);
  assert.equal(layout, "consolidated");
});

test("subsetPathsForLayout maps OSS docs differently by layout", () => {
  const splitPaths = subsetPathsForLayout("split");
  const consolidatedPaths = subsetPathsForLayout("consolidated");

  assert.ok(splitPaths.includes("oss/introduction.md"));
  assert.ok(!splitPaths.includes("introduction.md"));
  assert.ok(consolidatedPaths.includes("introduction.md"));
  assert.ok(!consolidatedPaths.includes("oss/introduction.md"));
  assert.ok(splitPaths.includes("pro/react-on-rails-pro.md"));
  assert.ok(consolidatedPaths.includes("pro/react-on-rails-pro.md"));
});

test("layout helpers reject unsupported layout values", () => {
  assert.throws(() => subsetPathsForLayout("hybrid"), /Unsupported docs layout: hybrid/);
  assert.throws(
    () => docsLayoutPaths("/tmp/docs", "hybrid"),
    /Unsupported docs layout: hybrid/
  );
});

test("excludeNamesForRootCopy excludes nested assets only for consolidated layout", () => {
  assert.deepEqual([...excludeNamesForRootCopy("split")], []);
  assert.deepEqual([...excludeNamesForRootCopy("consolidated")].sort(), ["assets", "images", "pro"]);
});
