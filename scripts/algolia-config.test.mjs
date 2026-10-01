import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const { loadSiteConfig } = require("../prototypes/docusaurus/node_modules/@docusaurus/core/lib/server/config.js");
const siteDir = resolve("prototypes/docusaurus");
const algoliaEnvKeys = [
  "ALGOLIA_APP_ID",
  "ALGOLIA_SEARCH_API_KEY",
  "ALGOLIA_INDEX_NAME",
];
const config = fs.readFileSync(
  "prototypes/docusaurus/docusaurus.config.ts",
  "utf8"
);
const workflow = fs.readFileSync(
  ".github/workflows/site-build-deploy.yml",
  "utf8"
);
const archivedVersions = JSON.parse(
  fs.readFileSync("prototypes/docusaurus/versions.json", "utf8")
);
const redirects = fs.readFileSync(
  "prototypes/docusaurus/static/_redirects",
  "utf8"
);

async function withAlgoliaEnv(env, callback) {
  const previousEnv = Object.fromEntries(
    algoliaEnvKeys.map((key) => [key, process.env[key]])
  );

  try {
    for (const key of algoliaEnvKeys) {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }

    return await callback();
  } finally {
    for (const key of algoliaEnvKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  }
}

test("Algolia configuration selects the expected search implementation", async () => {
  await withAlgoliaEnv({}, async () => {
    const { siteConfig } = await loadSiteConfig({ siteDir });
    assert.equal(siteConfig.themeConfig.algolia, undefined);
    assert.ok(
      siteConfig.themes.some(
        ([theme]) => theme === "@easyops-cn/docusaurus-search-local"
      )
    );
  });

  await withAlgoliaEnv(
    {
      ALGOLIA_APP_ID: "app-id",
      ALGOLIA_SEARCH_API_KEY: "search-key",
      ALGOLIA_INDEX_NAME: "reactonrails",
    },
    async () => {
      const { siteConfig } = await loadSiteConfig({ siteDir });
      assert.deepEqual(siteConfig.themeConfig.algolia, {
        appId: "app-id",
        apiKey: "search-key",
        indexName: "reactonrails",
        contextualSearch: true,
      });
    }
  );

  await withAlgoliaEnv({ ALGOLIA_APP_ID: "app-id" }, async () => {
    await assert.rejects(
      () => loadSiteConfig({ siteDir }),
      /Algolia search configuration is incomplete/
    );
  });
});

test("CI reads protected credentials without breaking fork builds", () => {
  assert.match(workflow, /ALGOLIA_APP_ID: \$\{\{ secrets\.ALGOLIA_APP_ID \}\}/);
  assert.match(workflow, /ALGOLIA_SEARCH_API_KEY: \$\{\{ secrets\.ALGOLIA_SEARCH_API_KEY \}\}/);
  assert.match(
    workflow,
    /ALGOLIA_INDEX_NAME: \$\{\{ secrets\.ALGOLIA_APP_ID != '' && secrets\.ALGOLIA_SEARCH_API_KEY != '' && vars\.ALGOLIA_INDEX_NAME \|\| '' \}\}/
  );
});

test("documentation versions keep v17 canonical and archive v16", async () => {
  await withAlgoliaEnv({}, async () => {
    const { siteConfig } = await loadSiteConfig({ siteDir });
    const [, classicOptions] = siteConfig.presets[0];
    const docs = classicOptions.docs;

    assert.equal(docs.lastVersion, "current");
    assert.deepEqual(docs.versions, {
      current: {
        label: "17.x (stable)",
        path: "",
        banner: "none",
      },
      16: {
        label: "16.x",
        path: "16",
        banner: "unmaintained",
      },
    });
    assert.ok(
      siteConfig.themeConfig.navbar.items.some(
        (item) => item.type === "docsVersionDropdown"
      )
    );
  });

  assert.deepEqual(archivedVersions, ["16"]);
  assert.ok(
    fs.existsSync("prototypes/docusaurus/versioned_docs/version-16/README.md")
  );
  assert.ok(
    fs.existsSync(
      "prototypes/docusaurus/versioned_docs/version-16/pro/react-on-rails-pro.md"
    )
  );
  assert.match(config, /version === '16' \? 'v16\.6\.0' : 'main'/);
  assert.match(redirects, /^\/docs\/17\/\* \/docs\/:splat 301$/m);
  assert.match(redirects, /^\/docs\/17 \/docs 301$/m);
});
