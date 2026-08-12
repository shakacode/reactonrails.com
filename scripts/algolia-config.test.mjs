import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const config = fs.readFileSync(
  "prototypes/docusaurus/docusaurus.config.ts",
  "utf8"
);
const workflow = fs.readFileSync(
  ".github/workflows/site-build-deploy.yml",
  "utf8"
);

test("Algolia is enabled only by a complete three-value configuration", () => {
  assert.match(config, /const algoliaConfig = \{[\s\S]*ALGOLIA_APP_ID[\s\S]*ALGOLIA_SEARCH_API_KEY[\s\S]*ALGOLIA_INDEX_NAME[\s\S]*\};/);
  assert.match(config, /const useAlgolia = algoliaConfigValues\.every\(Boolean\);/);
  assert.match(config, /if \(algoliaConfigValues\.some\(Boolean\) && !useAlgolia\)[\s\S]*throw new Error/);
});

test("CI reads protected credentials without breaking fork builds", () => {
  assert.match(workflow, /ALGOLIA_APP_ID: \$\{\{ secrets\.ALGOLIA_APP_ID \}\}/);
  assert.match(workflow, /ALGOLIA_SEARCH_API_KEY: \$\{\{ secrets\.ALGOLIA_SEARCH_API_KEY \}\}/);
  assert.match(
    workflow,
    /ALGOLIA_INDEX_NAME: \$\{\{ secrets\.ALGOLIA_APP_ID != '' && secrets\.ALGOLIA_SEARCH_API_KEY != '' && vars\.ALGOLIA_INDEX_NAME \|\| '' \}\}/
  );
});
