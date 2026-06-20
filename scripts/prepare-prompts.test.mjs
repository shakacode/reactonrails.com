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
    doc_route: "/docs/api-reference/ruby-api-pro#async_react_component"
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
    "# Ruby API Pro\n",
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
  assert.equal(catalog.prompts[1].doc_route, "/docs/api-reference/ruby-api-pro#async_react_component");
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
    "Use https://reactonrails.com/docs/api-reference/ruby-api-pro#async_react_component and then check https://reactonrails.com/docs/api-reference/ruby-api-pro#async_react_component again."
  );
  assert.match(artifacts.llmsTxt, /# React on Rails AI Prompts/);
  assert.match(artifacts.llmsTxt, /Doc: https:\/\/reactonrails\.com\/docs\/api-reference\/ruby-api-pro#async_react_component/);
});

test("validatePromptRoutes fails on dangling prepared doc routes", () => {
  const catalog = parsePromptsYaml(samplePromptsYaml);
  const routes = new Set(["/docs/getting-started/create-react-on-rails-app"]);

  assert.throws(
    () => validatePromptRoutes(catalog, routes),
    /async-rendering: \/docs\/api-reference\/ruby-api-pro#async_react_component/
  );
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
