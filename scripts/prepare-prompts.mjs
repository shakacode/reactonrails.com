import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const GENERATED_HEADER = [
  "/*",
  " * GENERATED FILE - DO NOT EDIT.",
  " * Source: content/upstream/prompts.yml",
  " * Regenerate with `npm run prepare:prompts`.",
  " */",
  "",
].join("\n");

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] ?? null;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
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

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function stripInlineComment(value) {
  const openingQuote = value[0];
  if (openingQuote === "\"" || openingQuote === "'") {
    let escaped = false;

    for (let index = 1; index < value.length; index += 1) {
      const char = value[index];

      if (openingQuote === "\"" && escaped) {
        escaped = false;
        continue;
      }
      if (openingQuote === "\"" && char === "\\") {
        escaped = true;
        continue;
      }
      if (openingQuote === "'" && char === "'" && value[index + 1] === "'") {
        index += 1;
        continue;
      }
      if (char === openingQuote) {
        const rest = value.slice(index + 1);
        return /^\s+#/.test(rest) ? value.slice(0, index + 1) : value;
      }
    }

    return value;
  }

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === "#" && index > 0 && /\s/.test(value[index - 1])) {
      return value.slice(0, index).trimEnd();
    }
  }

  return value;
}

function parseScalar(rawValue, context) {
  const value = stripInlineComment(rawValue.trim());
  if (value === "") {
    return "";
  }
  if (value.startsWith("\"")) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Invalid double-quoted YAML scalar at ${context}: ${error.message}`);
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) {
      throw new Error(`Invalid single-quoted YAML scalar at ${context}`);
    }
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  return value;
}

function parseKeyValue(source, context) {
  const match = source.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
  if (!match) {
    throw new Error(`Expected key/value at ${context}: ${source}`);
  }
  return [match[1], parseScalar(match[2] ?? "", context)];
}

function foldedBlockValue(lines) {
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      continue;
    }
    current.push(trimmed);
  }

  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs.join("\n");
}

function collectIndentedBlock(lines, startIndex) {
  const block = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed !== "" && /^\S/.test(line)) {
      break;
    }
    block.push({ line, lineNumber: index + 1 });
    index += 1;
  }

  return { block, nextIndex: index };
}

function parseScalarSequence(block, sectionName) {
  const values = [];
  for (const { line, lineNumber } of block) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const match = line.match(/^\s{2}-\s*(.+)$/);
    if (!match) {
      throw new Error(`Expected scalar list item in ${sectionName} at line ${lineNumber}`);
    }
    values.push(parseScalar(match[1], `${sectionName}:${lineNumber}`));
  }
  return values;
}

function parseObjectSequence(block, sectionName) {
  const entries = [];
  let current = null;

  for (const { line, lineNumber } of block) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const itemMatch = line.match(/^\s{2}-\s*(.*)$/);
    if (itemMatch) {
      if (current) {
        entries.push(current);
      }
      current = {};
      const firstProperty = itemMatch[1].trim();
      if (firstProperty) {
        const [key, value] = parseKeyValue(firstProperty, `${sectionName}:${lineNumber}`);
        current[key] = value;
      }
      continue;
    }

    const propertyMatch = line.match(/^\s{4}([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (!propertyMatch || !current) {
      throw new Error(`Expected object property in ${sectionName} at line ${lineNumber}`);
    }

    current[propertyMatch[1]] = parseScalar(
      propertyMatch[2] ?? "",
      `${sectionName}:${lineNumber}`
    );
  }

  if (current) {
    entries.push(current);
  }

  return entries;
}

export function parsePromptsYaml(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const parsed = {};
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      index += 1;
      continue;
    }

    const rootMatch = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (!rootMatch) {
      throw new Error(`Unsupported YAML root syntax at line ${index + 1}: ${line}`);
    }

    const key = rootMatch[1];
    const rawValue = rootMatch[2] ?? "";

    if (rawValue === ">-" || rawValue === ">") {
      const { block, nextIndex } = collectIndentedBlock(lines, index);
      parsed[key] = foldedBlockValue(block.map(({ line: blockLine }) => blockLine));
      index = nextIndex;
      continue;
    }

    if (rawValue === "") {
      const { block, nextIndex } = collectIndentedBlock(lines, index);
      if (key === "categories" || key === "prompts") {
        parsed[key] = parseObjectSequence(block, key);
      } else if (key === "home_prompt_ids") {
        parsed[key] = parseScalarSequence(block, key);
      } else {
        parsed[key] = "";
      }
      index = nextIndex;
      continue;
    }

    parsed[key] = parseScalar(rawValue, `line ${index + 1}`);
    index += 1;
  }

  return validatePromptCatalog(parsed);
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Expected ${field} to be a non-empty string`);
  }
  return value;
}

function assertUnique(values, field) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  if (duplicates.size > 0) {
    throw new Error(`Duplicate ${field}: ${[...duplicates].join(", ")}`);
  }
}

function validatePromptCatalog(parsed) {
  if (parsed.schema_version !== 1) {
    throw new Error(`Unsupported prompts schema_version: ${parsed.schema_version}`);
  }
  const siteUrl = requireString(parsed.site_url, "site_url").replace(/\/+$/, "");
  if (!/^https?:\/\//.test(siteUrl)) {
    throw new Error("Expected site_url to be an absolute http(s) URL");
  }

  const agentNote = requireString(parsed.agent_note, "agent_note");
  const categories = Array.isArray(parsed.categories) ? parsed.categories : [];
  const homePromptIds = Array.isArray(parsed.home_prompt_ids) ? parsed.home_prompt_ids : [];
  const prompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];

  if (categories.length === 0) {
    throw new Error("Expected at least one prompt category");
  }
  if (prompts.length === 0) {
    throw new Error("Expected at least one prompt");
  }

  for (const category of categories) {
    category.id = requireString(category.id, "categories[].id");
    category.eyebrow = requireString(category.eyebrow, `categories[${category.id}].eyebrow`);
    category.heading = requireString(category.heading, `categories[${category.id}].heading`);
  }
  assertUnique(categories.map((category) => category.id), "category id");
  const categoryIds = new Set(categories.map((category) => category.id));

  for (const promptId of homePromptIds) {
    requireString(promptId, "home_prompt_ids[]");
  }
  assertUnique(homePromptIds, "home prompt id");

  for (const prompt of prompts) {
    prompt.id = requireString(prompt.id, "prompts[].id");
    prompt.title = requireString(prompt.title, `prompts[${prompt.id}].title`);
    prompt.category = requireString(prompt.category, `prompts[${prompt.id}].category`);
    prompt.doc_route = requireString(prompt.doc_route, `prompts[${prompt.id}].doc_route`);
    prompt.prompt = requireString(prompt.prompt, `prompts[${prompt.id}].prompt`);

    if (!categoryIds.has(prompt.category)) {
      throw new Error(`Prompt ${prompt.id} references unknown category: ${prompt.category}`);
    }
    if (!prompt.doc_route.startsWith("/docs/")) {
      throw new Error(`Prompt ${prompt.id} doc_route must start with /docs/: ${prompt.doc_route}`);
    }
    if (prompt.doc_route.includes("?")) {
      throw new Error(`Prompt ${prompt.id} doc_route must not include a query string`);
    }
  }
  assertUnique(prompts.map((prompt) => prompt.id), "prompt id");

  const promptIds = new Set(prompts.map((prompt) => prompt.id));
  for (const promptId of homePromptIds) {
    if (!promptIds.has(promptId)) {
      throw new Error(`home_prompt_ids references unknown prompt id: ${promptId}`);
    }
  }

  return {
    schemaVersion: parsed.schema_version,
    siteUrl,
    agentNote,
    categories,
    homePromptIds,
    prompts,
  };
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return {};
  }

  const lines = markdown.split("\n");
  const frontmatter = {};
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "---") {
      return frontmatter;
    }
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
    if (match) {
      frontmatter[match[1]] = parseScalar(match[2], "frontmatter");
    }
  }

  return {};
}

function normalizeRoute(route) {
  const normalized = route.replace(/\/+$/, "");
  return normalized === "" ? "/" : normalized;
}

function defaultRouteForDoc(relativePath) {
  const withoutExtension = toPosix(relativePath).replace(/\.(md|mdx)$/i, "");
  const withoutIndex = withoutExtension.replace(/(?:^|\/)(?:README|index)$/i, "");
  if (withoutIndex === "") {
    return "/docs";
  }
  return normalizeRoute(`/docs/${withoutIndex}`);
}

function routeForDoc(relativePath, markdown) {
  const frontmatter = parseFrontmatter(markdown);
  if (typeof frontmatter.slug === "string" && frontmatter.slug.trim() !== "") {
    const rawSlug = frontmatter.slug.trim();
    if (rawSlug.startsWith("/")) {
      return normalizeRoute(`/docs/${rawSlug.replace(/^\/+/, "")}`);
    }

    const directory = toPosix(path.dirname(relativePath));
    const directoryPrefix = directory === "." ? "" : `${directory}/`;
    return normalizeRoute(`/docs/${directoryPrefix}${rawSlug.replace(/^\.\//, "")}`);
  }
  return defaultRouteForDoc(relativePath);
}

export async function collectPreparedDocRoutes(docsRoot) {
  if (!(await exists(docsRoot))) {
    throw new Error(`Prepared docs not found at ${docsRoot}. Run \`npm run prepare:docs\` first.`);
  }

  const routes = new Set();
  await walkFiles(docsRoot, async (absoluteFile, relativeFile) => {
    if (!/\.(md|mdx)$/i.test(relativeFile)) {
      return;
    }
    const markdown = await fs.readFile(absoluteFile, "utf8");
    routes.add(routeForDoc(relativeFile, markdown));
  });

  return routes;
}

function routeWithoutFragment(docRoute) {
  return normalizeRoute(docRoute.split("#")[0]);
}

export function validatePromptRoutes(catalog, preparedDocRoutes) {
  const missingRoutes = [];
  for (const prompt of catalog.prompts) {
    const route = routeWithoutFragment(prompt.doc_route);
    if (!preparedDocRoutes.has(route)) {
      missingRoutes.push(`${prompt.id}: ${prompt.doc_route}`);
    }
  }

  if (missingRoutes.length > 0) {
    throw new Error(
      [
        "Prompt doc_route validation failed. Missing prepared docs routes:",
        ...missingRoutes.map((missingRoute) => `- ${missingRoute}`),
      ].join("\n")
    );
  }
}

function promptDocUrl(catalog, prompt) {
  return `${catalog.siteUrl}${prompt.doc_route}`;
}

export function resolvedPrompts(catalog) {
  return catalog.prompts.map((prompt) => {
    const docUrl = promptDocUrl(catalog, prompt);
    return {
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
      doc_route: prompt.doc_route,
      doc_url: docUrl,
      prompt: prompt.prompt.replaceAll("{{doc_url}}", docUrl),
    };
  });
}

function tsString(value) {
  return JSON.stringify(value);
}

function tsPromptArray(catalog) {
  const prompts = resolvedPrompts(catalog);
  return `export const prompts: Prompt[] = ${JSON.stringify(
    prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      prompt: prompt.prompt,
      href: prompt.doc_route,
      category: prompt.category,
    })),
    null,
    2
  )};`;
}

function tsCategoryUnion(catalog) {
  return catalog.categories.map((category) => `  | ${tsString(category.id)}`).join("\n");
}

function tsPromptGroups(catalog) {
  return `export const promptGroups: PromptGroup[] = ${JSON.stringify(
    catalog.categories.map((category) => ({
      category: category.id,
      eyebrow: category.eyebrow,
      heading: category.heading,
    })),
    null,
    2
  )};`;
}

export function renderPromptsTs(catalog) {
  return `${GENERATED_HEADER}export const SITE_URL = ${tsString(catalog.siteUrl)};

export const agentNote = ${tsString(catalog.agentNote)};

export type PromptCategory =
${tsCategoryUnion(catalog)};

export type Prompt = {
  id: string;
  title: string;
  prompt: string;
  href: string;
  category: PromptCategory;
};

${tsPromptArray(catalog)}

const homePromptIds = ${JSON.stringify(catalog.homePromptIds)} as const;

export const homePrompts: Prompt[] = homePromptIds.map((id) => {
  const found = prompts.find((prompt) => prompt.id === id);
  if (!found) {
    throw new Error(\`homePromptIds references unknown prompt id: \${id}\`);
  }
  return found;
});

export type PromptGroup = {
  category: PromptCategory;
  eyebrow: string;
  heading: string;
};

${tsPromptGroups(catalog)}
`;
}

export function renderPromptsJson(catalog) {
  return `${JSON.stringify(
    {
      schema_version: catalog.schemaVersion,
      site_url: catalog.siteUrl,
      agent_note: catalog.agentNote,
      categories: catalog.categories,
      home_prompt_ids: catalog.homePromptIds,
      prompts: resolvedPrompts(catalog),
    },
    null,
    2
  )}\n`;
}

function llmsCategoryTitle(category) {
  return category.eyebrow || category.id;
}

export function renderLlmsTxt(catalog) {
  const prompts = resolvedPrompts(catalog);
  const promptsByCategory = new Map();
  for (const prompt of prompts) {
    const group = promptsByCategory.get(prompt.category) ?? [];
    group.push(prompt);
    promptsByCategory.set(prompt.category, group);
  }

  const lines = [
    "# React on Rails AI Prompts",
    "",
    `Source: ${catalog.siteUrl}/prompts.json`,
    `Schema version: ${catalog.schemaVersion}`,
    "",
    catalog.agentNote,
    "",
  ];

  for (const category of catalog.categories) {
    const categoryPrompts = promptsByCategory.get(category.id) ?? [];
    if (categoryPrompts.length === 0) {
      continue;
    }
    lines.push(`## ${llmsCategoryTitle(category)}`, "");
    for (const prompt of categoryPrompts) {
      lines.push(
        `### ${prompt.title}`,
        "",
        `ID: ${prompt.id}`,
        `Category: ${prompt.category}`,
        `Doc: ${prompt.doc_url}`,
        "",
        prompt.prompt,
        ""
      );
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderPromptArtifacts(catalog) {
  return {
    promptsTs: renderPromptsTs(catalog),
    promptsJson: renderPromptsJson(catalog),
    llmsTxt: renderLlmsTxt(catalog),
  };
}

async function writeOrCheckFile(targetPath, expected, check) {
  if (check) {
    const actual = await fs.readFile(targetPath, "utf8").catch(() => null);
    return actual === expected;
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, expected, "utf8");
  return true;
}

export async function writePromptArtifacts(artifacts, targets, { check = false } = {}) {
  const results = await Promise.all([
    writeOrCheckFile(targets.promptsTs, artifacts.promptsTs, check),
    writeOrCheckFile(targets.promptsJson, artifacts.promptsJson, check),
    writeOrCheckFile(targets.llmsTxt, artifacts.llmsTxt, check),
  ]);

  if (check && results.some((matched) => !matched)) {
    const labels = ["prompts.ts", "prompts.json", "llms.txt"];
    const drifted = results
      .map((matched, index) => (matched ? null : `- ${labels[index]}`))
      .filter(Boolean);
    throw new Error(
      [
        "Generated prompt artifacts are out of date. Run `npm run prepare:prompts`.",
        ...drifted,
      ].join("\n")
    );
  }
}

export async function preparePrompts({
  sourcePrompts,
  docsRoot,
  promptsTs,
  promptsJson,
  llmsTxt,
  check = false,
}) {
  if (!(await exists(sourcePrompts))) {
    throw new Error(`Synced prompts source not found at ${sourcePrompts}. Run \`npm run sync:docs\` first.`);
  }

  const source = await fs.readFile(sourcePrompts, "utf8");
  const catalog = parsePromptsYaml(source);
  const routes = await collectPreparedDocRoutes(docsRoot);
  validatePromptRoutes(catalog, routes);
  const artifacts = renderPromptArtifacts(catalog);
  await writePromptArtifacts(
    artifacts,
    {
      promptsTs,
      promptsJson,
      llmsTxt,
    },
    { check }
  );

  return {
    catalog,
    artifacts,
    routeCount: routes.size,
  };
}

async function main() {
  const siteRoot = path.join(workspaceRoot, "prototypes", "docusaurus");
  const check = process.argv.includes("--check");
  const result = await preparePrompts({
    sourcePrompts:
      argValue("--source") ?? path.join(workspaceRoot, "content", "upstream", "prompts.yml"),
    docsRoot: argValue("--docs-root") ?? path.join(siteRoot, "docs"),
    promptsTs:
      argValue("--prompts-ts") ?? path.join(siteRoot, "src", "constants", "prompts.ts"),
    promptsJson: argValue("--prompts-json") ?? path.join(siteRoot, "static", "prompts.json"),
    llmsTxt: argValue("--llms-txt") ?? path.join(siteRoot, "static", "llms.txt"),
    check,
  });

  const mode = check ? "Validated" : "Generated";
  console.log(
    `${mode} prompt artifacts from ${path.relative(workspaceRoot, argValue("--source") ?? path.join(workspaceRoot, "content", "upstream", "prompts.yml"))}`
  );
  console.log(`Prompt count: ${result.catalog.prompts.length}`);
  console.log(`Prepared doc routes checked: ${result.routeCount}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
