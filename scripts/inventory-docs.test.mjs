import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyPage,
  countWords,
  extractFrontmatter,
  pageTitle,
  resolveDocLink,
  sidebarIdCandidates,
} from "./inventory-docs.mjs";

const basePage = {
  path: "oss/building-features/example.md",
  words: 1000,
  lastCommitDate: null,
  inboundLinks: 3,
  inSidebar: true,
  hasDescription: true,
};

test("classifyPage flags short, long, stale, orphan, and missing-description pages", () => {
  const now = Date.parse("2026-07-09");
  assert.deepEqual(classifyPage(basePage, { now }), []);
  assert.deepEqual(classifyPage({ ...basePage, words: 100 }, { now }), ["tooShort"]);
  assert.deepEqual(classifyPage({ ...basePage, words: 5000 }, { now }), ["tooLong"]);
  assert.deepEqual(
    classifyPage({ ...basePage, lastCommitDate: "2026-01-01" }, { now }),
    ["stale"]
  );
  assert.deepEqual(
    classifyPage({ ...basePage, inboundLinks: 0, inSidebar: false }, { now }),
    ["orphan"]
  );
  assert.deepEqual(classifyPage({ ...basePage, hasDescription: false }, { now }), [
    "missingDescription",
  ]);
});

test("classifyPage exempts index and release-note pages from tooShort", () => {
  const now = Date.parse("2026-07-09");
  for (const path of [
    "oss/deployment/README.md",
    "pro/release-notes/index.md",
    "oss/upgrading/release-notes/16.3.0.md",
  ]) {
    assert.deepEqual(classifyPage({ ...basePage, path, words: 50 }, { now }), []);
  }
});

test("resolveDocLink resolves relative doc links and rejects everything else", () => {
  const from = "oss/migrating/migrating-from-inertia-rails.md";
  assert.equal(
    resolveDocLink(from, "../building-features/forms.md"),
    "oss/building-features/forms.md"
  );
  assert.equal(
    resolveDocLink(from, "./example-migrations.md#criteria"),
    "oss/migrating/example-migrations.md"
  );
  assert.equal(resolveDocLink(from, "https://example.com/page.md"), null);
  assert.equal(resolveDocLink(from, "/docs/getting-started/quick-start"), null);
  assert.equal(resolveDocLink(from, "#anchor-only"), null);
  assert.equal(resolveDocLink(from, "../../../../etc/passwd.md"), null);
});

test("sidebarIdCandidates strips extension and the oss/ prefix", () => {
  assert.deepEqual(sidebarIdCandidates("oss/migrating/foo.md"), [
    "oss/migrating/foo",
    "migrating/foo",
  ]);
  assert.deepEqual(sidebarIdCandidates("pro/streaming-ssr.md"), ["pro/streaming-ssr"]);
});

test("frontmatter parsing extracts description and title, and word count excludes it", () => {
  const content = `---\ntitle: "My Page"\ndescription: What this page covers\n---\n\nOne two three four five\n`;
  const { description, title } = extractFrontmatter(content);
  assert.equal(description, "What this page covers");
  assert.equal(title, "My Page");
  assert.equal(pageTitle(content), "My Page");
  assert.equal(countWords(content), 5);
});

test("pageTitle falls back to the first H1", () => {
  assert.equal(pageTitle("# Hello World\n\nBody text\n"), "Hello World");
  assert.equal(pageTitle("no headings here\n"), null);
});
