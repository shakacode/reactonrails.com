import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  docsHomeMarkdown,
  fixProNodeRendererMdx,
  injectProFriendlyNotice,
  rewriteFlattenedOssLinks,
  rewriteProLinks,
  siteSidebarSource,
} from "./prepare-docs.mjs";

async function withTempDir(callback) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "prepare-docs-test-"));
  try {
    return await callback(tmpDir);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

test("prepare docs keeps external Pro pricing links", async () => {
  await withTempDir(async (docsRoot) => {
    const ossDocPath = path.join(docsRoot, "getting-started", "oss-vs-pro.md");
    const proDocPath = path.join(docsRoot, "pro", "installation.md");
    await fs.mkdir(path.dirname(ossDocPath), { recursive: true });
    await fs.mkdir(path.dirname(proDocPath), { recursive: true });
    await fs.writeFile(
      ossDocPath,
      "[Pro pricing and sign up](https://pro.reactonrails.com/)\n",
      "utf8"
    );
    await fs.writeFile(
      proDocPath,
      "[Pro pricing and sign up](https://pro.reactonrails.com/)\n",
      "utf8"
    );

    await rewriteFlattenedOssLinks(docsRoot);
    await rewriteProLinks(path.join(docsRoot, "pro"));

    assert.match(await fs.readFile(ossDocPath, "utf8"), /https:\/\/pro\.reactonrails\.com\//);
    assert.match(await fs.readFile(proDocPath, "utf8"), /https:\/\/pro\.reactonrails\.com\//);
  });
});

test("prepare docs injects current friendly license model notice", async () => {
  await withTempDir(async (docsRoot) => {
    const proIntroPath = path.join(docsRoot, "pro", "react-on-rails-pro.md");
    await fs.mkdir(path.dirname(proIntroPath), { recursive: true });
    await fs.writeFile(
      proIntroPath,
      "# React on Rails Pro\n\nExisting Pro overview.\n",
      "utf8"
    );

    await injectProFriendlyNotice(docsRoot);

    const updated = await fs.readFile(proIntroPath, "utf8");
    assert.match(updated, /slug: \/pro/);
    assert.match(updated, /Friendly license model/);
    assert.match(updated, /development, test, CI\/CD, and staging/);
    assert.match(updated, /https:\/\/pro\.reactonrails\.com\//);
    assert.doesNotMatch(updated, /Friendly evaluation policy/);
  });
});

test("docs homepage uses current friendly license model copy", () => {
  const sourceMarkdown = `# React on Rails

## Friendly evaluation policy

- You can try React on Rails Pro without a license while evaluating.
- If your organization is budget-constrained, [contact us](mailto:justin@shakacode.com) about free licenses.

## Need more help?
`;

  const updated = docsHomeMarkdown(sourceMarkdown, { hasArchive: false });

  assert.match(updated, /## Friendly License Model/);
  assert.match(updated, /development, test, CI\/CD, and staging/);
  assert.match(updated, /https:\/\/pro\.reactonrails\.com\//);
  assert.doesNotMatch(updated, /Friendly evaluation policy/);
});

test("site sidebar labels the external changelog as the GitHub changelog", () => {
  const source = `const sidebars = {
  docsSidebar: [
    {
      type: 'link',
      label: 'Full Changelog',
      href: 'https://github.com/shakacode/react_on_rails/blob/main/CHANGELOG.md',
    },
  ],
};
`;

  const updated = siteSidebarSource(source, { hasArchive: false });

  assert.match(updated, /label: 'Full GitHub Changelog'/);
  assert.doesNotMatch(updated, /label: 'Full Changelog'/);
  assert.match(updated, /CHANGELOG\.md/);
});

test("Pro node renderer table comparisons are escaped for MDX", () => {
  const sourceMarkdown = "| First request on fresh deploy | 410->retry | Direct render: <50ms |\n";

  assert.equal(
    fixProNodeRendererMdx(sourceMarkdown),
    "| First request on fresh deploy | 410->retry | Direct render: &lt;50ms |\n"
  );
});
