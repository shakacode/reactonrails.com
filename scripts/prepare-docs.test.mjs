import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  changelogMarkdown,
  copySyncedStaticFiles,
  docsHomeMarkdown,
  fixProNodeRendererMdx,
  injectProTrustBasedLicensingNotice,
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

test("prepare docs injects trust-based commercial licensing notice", async () => {
  await withTempDir(async (docsRoot) => {
    const proIntroPath = path.join(docsRoot, "pro", "react-on-rails-pro.md");
    await fs.mkdir(path.dirname(proIntroPath), { recursive: true });
    await fs.writeFile(
      proIntroPath,
      "# React on Rails Pro\n\nExisting Pro overview.\n",
      "utf8"
    );

    await injectProTrustBasedLicensingNotice(docsRoot);

    const updated = await fs.readFile(proIntroPath, "utf8");
    assert.match(updated, /slug: \/pro/);
    assert.match(updated, /ShakaCode Trust-Based Commercial Licensing/);
    assert.match(updated, /Free to learn, evaluate, demo/);
    assert.match(updated, /private business value in production/);
    assert.match(updated, /React on Rails Pro EULA/);
    assert.match(updated, /development, test, CI\/CD, and staging/);
    assert.match(updated, /https:\/\/pro\.reactonrails\.com\//);
    assert.doesNotMatch(updated, /Friendly license model/);
    assert.doesNotMatch(updated, /Friendly evaluation policy/);
    assert.doesNotMatch(updated, /Honest License/);
  });
});

test("prepare docs replaces multi-line legacy Pro licensing notice", async () => {
  await withTempDir(async (docsRoot) => {
    const proIntroPath = path.join(docsRoot, "pro", "react-on-rails-pro.md");
    await fs.mkdir(path.dirname(proIntroPath), { recursive: true });
    await fs.writeFile(
      proIntroPath,
      `# React on Rails Pro

> **Friendly license model**
> You can try React on Rails Pro in development without a license.
> Teams should contact us before production.

Existing Pro overview.
`,
      "utf8"
    );

    await injectProTrustBasedLicensingNotice(docsRoot);

    const updated = await fs.readFile(proIntroPath, "utf8");
    assert.match(updated, /ShakaCode Trust-Based Commercial Licensing/);
    assert.match(updated, /private business value in production/);
    assert.doesNotMatch(updated, /Friendly license model/);
    assert.doesNotMatch(updated, /Teams should contact us before production/);
  });
});

test("prepare docs normalizes existing Pro trust-based licensing section", async () => {
  await withTempDir(async (docsRoot) => {
    const proIntroPath = path.join(docsRoot, "pro", "react-on-rails-pro.md");
    await fs.mkdir(path.dirname(proIntroPath), { recursive: true });
    await fs.writeFile(
      proIntroPath,
      `# React on Rails Pro

## ShakaCode Trust-Based Commercial Licensing

Trust-based means ShakaCode keeps evaluation low-friction instead of forcing runtime lockouts in non-production environments.
It relies on professional teams to purchase a license before production deployment.

## Explore the Dummy App
`,
      "utf8"
    );

    await injectProTrustBasedLicensingNotice(docsRoot);

    const updated = await fs.readFile(proIntroPath, "utf8");
    assert.match(updated, /ShakaCode Trust-Based Commercial Licensing/);
    assert.match(updated, /private business value in production/);
    assert.match(updated, /React on Rails Pro EULA/);
    assert.match(updated, /## Explore the Dummy App/);
    assert.doesNotMatch(updated, /professional teams to purchase/);
  });
});

test("docs homepage uses trust-based commercial licensing copy", () => {
  const sourceMarkdown = `# React on Rails

## Friendly evaluation policy

- You can try React on Rails Pro without a license while evaluating.
- If your organization is budget-constrained, [contact us](mailto:justin@shakacode.com) about free licenses.

## Need more help?
`;

  const updated = docsHomeMarkdown(sourceMarkdown, { hasArchive: false });

  assert.match(updated, /## ShakaCode Trust-Based Commercial Licensing/);
  assert.match(updated, /Free to learn, evaluate, demo/);
  assert.match(updated, /private business value in production/);
  assert.match(updated, /React on Rails Pro EULA/);
  assert.match(updated, /development, test, CI\/CD, and staging/);
  assert.match(updated, /https:\/\/pro\.reactonrails\.com\//);
  assert.doesNotMatch(updated, /Friendly License Model/);
  assert.doesNotMatch(updated, /Friendly evaluation policy/);
  assert.doesNotMatch(updated, /Honest License/);
});

test("docs homepage inserts trust-based commercial licensing copy when no legacy section exists", () => {
  const sourceMarkdown = `# React on Rails

## Need more help?
`;

  const updated = docsHomeMarkdown(sourceMarkdown, { hasArchive: false });

  assert.match(updated, /## ShakaCode Trust-Based Commercial Licensing/);
  assert.match(updated, /## Need more help\?/);
  assert.match(updated, /private business value in production/);
  assert.match(updated, /React on Rails Pro EULA/);
  assert(updated.indexOf("## ShakaCode Trust-Based Commercial Licensing") < updated.indexOf("## Need more help?"));
});

test("docs homepage renders a package table with linked names and live version badges", () => {
  const sourceMarkdown = `# React on Rails

## Need more help?
`;

  const updated = docsHomeMarkdown(sourceMarkdown, { hasArchive: false });

  // Heading + table scaffold
  assert.match(updated, /## Packages/);
  assert.match(updated, /\| Package \| Version \| Registry \| Description \|/);

  // Every package: name links to its registry page, version renders as a live
  // shields.io badge, and the registry column labels the source.
  assert.match(
    updated,
    /\| \[`react_on_rails`\]\(https:\/\/rubygems\.org\/gems\/react_on_rails\) \| \[!\[react_on_rails version\]\(https:\/\/img\.shields\.io\/gem\/v\/react_on_rails\?label=\)\]\(https:\/\/rubygems\.org\/gems\/react_on_rails\) \| RubyGems \|/
  );
  assert.match(
    updated,
    /\| \[`react-on-rails`\]\(https:\/\/www\.npmjs\.com\/package\/react-on-rails\) \| \[!\[react-on-rails version\]\(https:\/\/img\.shields\.io\/npm\/v\/react-on-rails\?label=\)\]\(https:\/\/www\.npmjs\.com\/package\/react-on-rails\) \| npm \|/
  );

  // Remaining packages each appear with a registry page link and a version badge.
  for (const name of [
    "react_on_rails_pro",
    "react-on-rails-pro",
    "react-on-rails-pro-node-renderer",
    "react-on-rails-rsc",
    "create-react-on-rails-app",
  ]) {
    assert.match(updated, new RegExp(`\\[\`${name}\`\\]`));
    assert.match(updated, new RegExp(`img\\.shields\\.io/(npm|gem)/v/${name}\\?label=`));
  }
});

test("site sidebar replaces the external changelog link with an internal doc reference", () => {
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

  assert.match(updated, /type: 'doc'/);
  assert.match(updated, /id: 'upgrading\/changelog'/);
  assert.match(updated, /label: 'Changelog'/);
  assert.doesNotMatch(updated, /label: 'Full Changelog'/);
  assert.doesNotMatch(updated, /github\.com\/shakacode\/react_on_rails\/blob\/main\/CHANGELOG\.md/);
});

test("changelog markdown injects frontmatter, opts out of MDX, and drops the upstream H1", () => {
  const source = `# Change Log

All notable changes...

## [Unreleased]
- Something new. [PR 1](https://example.com/pr/1)
`;

  const updated = changelogMarkdown(source);

  assert.match(updated, /^---\nid: changelog\n/);
  assert.match(updated, /title: Changelog/);
  assert.match(updated, /slug: \/upgrading\/changelog/);
  assert.match(updated, /mdx:\n {2}format: md/);
  assert.match(updated, /custom_edit_url: https:\/\/github\.com\/shakacode\/react_on_rails\/edit\/main\/CHANGELOG\.md/);
  assert.doesNotMatch(updated, /^# Change Log/m);
  assert.match(updated, /## \[Unreleased\]/);
  assert.match(updated, /All notable changes\.\.\./);
});

test("changelog markdown rewrites source-repo-relative links", () => {
  const source = `# Change Log

- See [Pro config](docs/oss/configuration/configuration-pro.md) and [release notes](docs/oss/upgrading/release-notes/16.0.0.md#breaking-changes).
- See the [README.md](./README.md).
- [react_on_rails/spec/dummy](react_on_rails/spec/dummy) is a sample app.
- External [PR 1](https://github.com/shakacode/react_on_rails/pull/1) is untouched.
`;

  const updated = changelogMarkdown(source);

  assert.match(updated, /\]\(\/docs\/configuration\/configuration-pro\)/);
  assert.match(updated, /\]\(\/docs\/upgrading\/release-notes\/16\.0\.0#breaking-changes\)/);
  assert.match(updated, /\]\(https:\/\/github\.com\/shakacode\/react_on_rails\/blob\/main\/README\.md\)/);
  assert.match(updated, /\]\(https:\/\/github\.com\/shakacode\/react_on_rails\/tree\/main\/spec\/dummy\)/);
  assert.match(updated, /\]\(https:\/\/github\.com\/shakacode\/react_on_rails\/pull\/1\)/);
  assert.doesNotMatch(updated, /docs\/oss\//);
  assert.doesNotMatch(updated, /\]\(\.\/README\.md\)/);
});

test("changelog markdown is idempotent on a body without the upstream H1", () => {
  const source = `Just some preface text.

## [1.0.0]
- First entry.
`;

  const updated = changelogMarkdown(source);

  assert.match(updated, /title: Changelog/);
  assert.match(updated, /Just some preface text\./);
  assert.match(updated, /## \[1\.0\.0\]/);
});

test("Pro node renderer table comparisons are escaped for MDX", () => {
  const sourceMarkdown = "| First request on fresh deploy | 410->retry | Direct render: <50ms |\n";

  assert.equal(
    fixProNodeRendererMdx(sourceMarkdown),
    "| First request on fresh deploy | 410->retry | Direct render: &lt;50ms |\n"
  );
});

test("prepare docs copies synced llms files to the Docusaurus static root", async () => {
  await withTempDir(async (tmpDir) => {
    const upstreamStatic = path.join(tmpDir, "upstream-static");
    const docusaurusStatic = path.join(tmpDir, "docusaurus-static");
    await fs.mkdir(upstreamStatic, { recursive: true });
    await fs.mkdir(docusaurusStatic, { recursive: true });

    await fs.writeFile(path.join(upstreamStatic, "llms.txt"), "llms index\n", "utf8");
    await fs.writeFile(path.join(upstreamStatic, "llms-full.txt"), "oss full\n", "utf8");
    await fs.writeFile(path.join(upstreamStatic, "llms-full-pro.txt"), "pro full\n", "utf8");
    await fs.writeFile(path.join(upstreamStatic, "ignored.txt"), "ignored\n", "utf8");
    await fs.writeFile(path.join(docusaurusStatic, "llms-full.txt"), "stale\n", "utf8");

    const copied = await copySyncedStaticFiles(upstreamStatic, docusaurusStatic);

    assert.deepEqual(copied.sort(), ["llms-full-pro.txt", "llms-full.txt", "llms.txt"]);
    assert.equal(await fs.readFile(path.join(docusaurusStatic, "llms.txt"), "utf8"), "llms index\n");
    assert.equal(
      await fs.readFile(path.join(docusaurusStatic, "llms-full.txt"), "utf8"),
      "oss full\n"
    );
    assert.equal(
      await fs.readFile(path.join(docusaurusStatic, "llms-full-pro.txt"), "utf8"),
      "pro full\n"
    );
    await assert.rejects(
      fs.access(path.join(docusaurusStatic, "ignored.txt")),
      /ENOENT/
    );
  });
});
