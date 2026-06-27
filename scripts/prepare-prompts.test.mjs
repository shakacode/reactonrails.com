import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  collectPreparedDocRoutes,
  parsePromptsYaml,
  preparePrompts,
  renderPromptArtifacts,
  validatePromptRoutes,
  writePromptArtifacts,
} from "./prepare-prompts.mjs";

async function withTempDir(callback) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "prepare-prompts-test-"));
  try {
    return await callback(tmpDir);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

const samplePromptsYaml = `schema_version: 1
site_url: https://reactonrails.com
agent_note: >-
  Paste this into an AI assistant. It should use the official docs.

# A root comment after a folded block must not become part of agent_note.
categories:
  - id: get-started
    eyebrow: Get started
    heading: Spin up React on Rails.
  - id: pro
    eyebrow: Pro
    heading: Use React on Rails Pro.

home_prompt_ids:
  - create-app

prompts:
  - id: create-app
    title: Start a new app
    category: get-started
    doc_route: /docs/getting-started/create-react-on-rails-app
    prompt: "Follow {{doc_url}} exactly."
  - id: async-rendering
    title: Use async rendering
    category: pro
    doc_route: "/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options--"
    prompt: "Use {{doc_url}} and then check {{doc_url}} again."
`;

async function writePreparedDocs(docsRoot) {
  await fs.mkdir(path.join(docsRoot, "getting-started"), { recursive: true });
  await fs.mkdir(path.join(docsRoot, "api-reference"), { recursive: true });
  await fs.mkdir(path.join(docsRoot, "pro"), { recursive: true });
  await fs.writeFile(
    path.join(docsRoot, "getting-started", "create-react-on-rails-app.md"),
    "# Create React on Rails App\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(docsRoot, "getting-started", "installation-into-an-existing-rails-app.md"),
    "---\nslug: existing-rails-app\n---\n\n# Install into an Existing Rails App\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(docsRoot, "api-reference", "ruby-api-pro.md"),
    [
      "# Ruby API Pro",
      "",
      "### 🚀 Step 1: Install React on Rails (3 minutes)",
      "",
      "### React canary: `<ViewTransition>` status (experimental)",
      "",
      "### Foo",
      "",
      "### Foo-1",
      "",
      "### Foo",
      "",
      "### `async_react_component(component_name, options = {})`",
      "",
      "### 1. [Preparing Your App](rsc-preparing-app.md)",
      "",
      "### Production Case Study: Popmenu {#popmenu}",
      "",
      "### Versioned API {#api.v1}",
      "",
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(docsRoot, "pro", "react-on-rails-pro.md"),
    "---\nslug: /pro\n---\n\n# React on Rails Pro\n",
    "utf8"
  );
}

test("parsePromptsYaml validates schema and folds block strings", () => {
  const catalog = parsePromptsYaml(samplePromptsYaml);

  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.siteUrl, "https://reactonrails.com");
  assert.equal(
    catalog.agentNote,
    "Paste this into an AI assistant. It should use the official docs."
  );
  assert.deepEqual(
    catalog.categories.map((category) => category.id),
    ["get-started", "pro"]
  );
  assert.equal(catalog.prompts[1].doc_route, "/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options--");
});

test("parsePromptsYaml handles comments outside quoted scalars and inside folded blocks", () => {
  const catalog = parsePromptsYaml(`schema_version: 1
site_url: https://reactonrails.com
agent_note: >-
  Keep the next marker literal.
  # Not a YAML comment inside a block scalar.

categories:
  - id: get-started
    eyebrow: "Get # started" # outside comment
    heading: 'Spin up React # on Rails.'

home_prompt_ids:
  - create-app

prompts:
  - id: create-app
    title: "Start # a new app" # outside comment
    category: get-started
    doc_route: /docs/getting-started/create-react-on-rails-app
    prompt: "Follow {{doc_url}} # exactly."
  - id: existing-app
    title: Don't skip setup # outside comment
    category: get-started
    doc_route: /docs/getting-started/create-react-on-rails-app
    prompt: Follow {{doc_url}} exactly. # outside comment
`);

  assert.equal(
    catalog.agentNote,
    "Keep the next marker literal. # Not a YAML comment inside a block scalar."
  );
  assert.equal(catalog.categories[0].eyebrow, "Get # started");
  assert.equal(catalog.categories[0].heading, "Spin up React # on Rails.");
  assert.equal(catalog.prompts[0].title, "Start # a new app");
  assert.equal(catalog.prompts[0].prompt, "Follow {{doc_url}} # exactly.");
  assert.equal(catalog.prompts[1].title, "Don't skip setup");
  assert.equal(catalog.prompts[1].prompt, "Follow {{doc_url}} exactly.");
});

test("collectPreparedDocRoutes includes default routes and frontmatter slugs", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);

    const routes = await collectPreparedDocRoutes(docsRoot);

    assert.ok(routes.has("/docs/getting-started/create-react-on-rails-app"));
    assert.ok(routes.has("/docs/getting-started/existing-rails-app"));
    assert.ok(routes.has("/docs/api-reference/ruby-api-pro"));
    assert.ok(routes.has("/docs/pro"));
  });
});

test("renderPromptArtifacts expands doc URLs in TypeScript and public artifacts", () => {
  const catalog = parsePromptsYaml(samplePromptsYaml);
  const artifacts = renderPromptArtifacts(catalog);

  assert.match(artifacts.promptsTs, /GENERATED FILE - DO NOT EDIT/);
  assert.match(artifacts.promptsTs, /https:\/\/reactonrails\.com\/docs\/getting-started\/create-react-on-rails-app/);
  assert.doesNotMatch(artifacts.promptsTs, /\{\{doc_url\}\}/);

  const promptsJson = JSON.parse(artifacts.promptsJson);
  assert.equal(
    promptsJson.prompts[1].prompt,
    "Use https://reactonrails.com/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options-- and then check https://reactonrails.com/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options-- again."
  );
  assert.match(artifacts.llmsTxt, /# React on Rails AI Prompts/);
  assert.match(artifacts.llmsTxt, /Doc: https:\/\/reactonrails\.com\/docs\/api-reference\/ruby-api-pro#async_react_componentcomponent_name-options--/);
});

test("validatePromptRoutes fails on dangling prepared doc routes", () => {
  const catalog = parsePromptsYaml(samplePromptsYaml);
  const routes = new Set(["/docs/getting-started/create-react-on-rails-app"]);

  assert.throws(
    () => validatePromptRoutes(catalog, routes),
    /async-rendering: \/docs\/api-reference\/ruby-api-pro#async_react_componentcomponent_name-options--/
  );
});

test("validatePromptRoutes fails on dangling prepared doc anchors", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace("#async_react_component", "#missing_anchor")
    );
    const routes = await collectPreparedDocRoutes(docsRoot);

    assert.throws(
      () => validatePromptRoutes(catalog, routes),
      /Missing prepared docs anchors:[\s\S]*async-rendering: \/docs\/api-reference\/ruby-api-pro#missing_anchor/
    );
  });
});

test("validatePromptRoutes excludes page h1 text from prepared doc anchors", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace("#async_react_componentcomponent_name-options--", "#ruby-api-pro")
    );
    const routes = await collectPreparedDocRoutes(docsRoot);

    assert.throws(
      () => validatePromptRoutes(catalog, routes),
      /Missing prepared docs anchors:[\s\S]*async-rendering: \/docs\/api-reference\/ruby-api-pro#ruby-api-pro/
    );
  });
});

test("validatePromptRoutes honors explicit Docusaurus heading anchors", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const routes = await collectPreparedDocRoutes(docsRoot);
    const validCatalog = parsePromptsYaml(
      samplePromptsYaml.replace("#async_react_componentcomponent_name-options--", "#popmenu")
    );
    const invalidCatalog = parsePromptsYaml(
      samplePromptsYaml.replace(
        "#async_react_componentcomponent_name-options--",
        "#production-case-study-popmenu"
      )
    );

    assert.doesNotThrow(() => validatePromptRoutes(validCatalog, routes));
    assert.throws(
      () => validatePromptRoutes(invalidCatalog, routes),
      /Missing prepared docs anchors:[\s\S]*async-rendering: \/docs\/api-reference\/ruby-api-pro#production-case-study-popmenu/
    );
  });
});

test("validatePromptRoutes accepts Docusaurus explicit anchors with punctuation", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const routes = await collectPreparedDocRoutes(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace(
        "#async_react_componentcomponent_name-options--",
        "#api.v1"
      )
    );

    assert.doesNotThrow(() => validatePromptRoutes(catalog, routes));
  });
});

test("validatePromptRoutes ignores markdown link destinations in heading anchors", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const routes = await collectPreparedDocRoutes(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace(
        "#async_react_componentcomponent_name-options--",
        "#1-preparing-your-app"
      )
    );

    assert.doesNotThrow(() => validatePromptRoutes(catalog, routes));
  });
});

test("validatePromptRoutes matches Docusaurus slugging for emoji headings", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const routes = await collectPreparedDocRoutes(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace(
        "#async_react_componentcomponent_name-options--",
        "#-step-1-install-react-on-rails-3-minutes"
      )
    );

    assert.doesNotThrow(() => validatePromptRoutes(catalog, routes));
  });
});

test("validatePromptRoutes preserves inline code text in heading anchors", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const routes = await collectPreparedDocRoutes(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace(
        "#async_react_componentcomponent_name-options--",
        "#react-canary-viewtransition-status-experimental"
      )
    );

    assert.doesNotThrow(() => validatePromptRoutes(catalog, routes));
  });
});

test("validatePromptRoutes matches Docusaurus duplicate heading collisions", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    await writePreparedDocs(docsRoot);
    const routes = await collectPreparedDocRoutes(docsRoot);
    const catalog = parsePromptsYaml(
      samplePromptsYaml.replace(
        "#async_react_componentcomponent_name-options--",
        "#foo-2"
      )
    );

    assert.doesNotThrow(() => validatePromptRoutes(catalog, routes));
  });
});

test("preparePrompts writes artifacts and check mode detects drift", async () => {
  await withTempDir(async (tmpDir) => {
    const docsRoot = path.join(tmpDir, "docs");
    const sourcePrompts = path.join(tmpDir, "content", "upstream", "prompts.yml");
    const promptsTs = path.join(tmpDir, "site", "src", "constants", "prompts.ts");
    const promptsJson = path.join(tmpDir, "site", "static", "prompts.json");
    const llmsTxt = path.join(tmpDir, "site", "static", "llms.txt");

    await writePreparedDocs(docsRoot);
    await fs.mkdir(path.dirname(sourcePrompts), { recursive: true });
    await fs.writeFile(sourcePrompts, samplePromptsYaml, "utf8");

    const result = await preparePrompts({
      sourcePrompts,
      docsRoot,
      promptsTs,
      promptsJson,
      llmsTxt,
    });

    assert.equal(result.catalog.prompts.length, 2);
    assert.match(await fs.readFile(promptsTs, "utf8"), /export const homePrompts/);

    await preparePrompts({
      sourcePrompts,
      docsRoot,
      promptsTs,
      promptsJson,
      llmsTxt,
      check: true,
    });

    await fs.writeFile(llmsTxt, "hand edited\n", "utf8");
    await assert.rejects(
      () =>
        preparePrompts({
          sourcePrompts,
          docsRoot,
          promptsTs,
          promptsJson,
          llmsTxt,
          failOnWriteDrift: true,
        }),
      /Generated prompt artifacts changed during prepare[\s\S]*llms\.txt/
    );
    assert.match(await fs.readFile(llmsTxt, "utf8"), /# React on Rails AI Prompts/);

    await fs.writeFile(llmsTxt, "hand edited again\n", "utf8");
    await assert.rejects(
      () =>
        preparePrompts({
          sourcePrompts,
          docsRoot,
          promptsTs,
          promptsJson,
          llmsTxt,
          check: true,
        }),
      /Generated prompt artifacts are out of date/
    );
  });
});

test("writePromptArtifacts reports which generated file drifted", async () => {
  await withTempDir(async (tmpDir) => {
    const targets = {
      promptsTs: path.join(tmpDir, "prompts.ts"),
      promptsJson: path.join(tmpDir, "prompts.json"),
      llmsTxt: path.join(tmpDir, "llms.txt"),
    };
    const artifacts = {
      promptsTs: "ts\n",
      promptsJson: "{}\n",
      llmsTxt: "llms\n",
    };

    await writePromptArtifacts(artifacts, targets);
    await fs.writeFile(targets.promptsJson, "changed\n", "utf8");

    await assert.rejects(
      () => writePromptArtifacts(artifacts, targets, { check: true }),
      /prompts\.json/
    );
  });
});
