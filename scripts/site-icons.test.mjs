import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");
const docusaurusConfigPath = path.join(
  workspaceRoot,
  "prototypes",
  "docusaurus",
  "docusaurus.config.ts"
);
const staticRoot = path.join(workspaceRoot, "prototypes", "docusaurus", "static");
const sitePackagePath = path.join(workspaceRoot, "prototypes", "docusaurus", "package.json");
const siteRequire = createRequire(sitePackagePath);
const createJiti = siteRequire("jiti");

async function loadDocusaurusConfig() {
  const jiti = createJiti(__filename, { interopDefault: true });
  return jiti(docusaurusConfigPath);
}

function withBaseUrl(baseUrl, assetPath) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}${assetPath.replace(/^\/+/, "")}`;
}

function findHeadLink(headTags, rel, attributes = {}) {
  return headTags.find((tag) => {
    if (tag.tagName !== "link" || tag.attributes?.rel !== rel) {
      return false;
    }

    return Object.entries(attributes).every(
      ([name, value]) => tag.attributes?.[name] === value
    );
  });
}

test("Docusaurus head advertises high resolution app icons", async () => {
  const config = await loadDocusaurusConfig();
  const headTags = config.headTags ?? [];

  const appleTouchIcon = findHeadLink(headTags, "apple-touch-icon");
  assert.equal(appleTouchIcon?.attributes?.sizes, "192x192");
  assert.equal(
    appleTouchIcon?.attributes?.href,
    withBaseUrl(config.baseUrl, "img/icon-192.png")
  );

  const pngIcon = findHeadLink(headTags, "icon", { sizes: "512x512" });
  assert.equal(pngIcon?.attributes?.type, "image/png");
  assert.equal(
    pngIcon?.attributes?.href,
    withBaseUrl(config.baseUrl, "img/icon-512.png")
  );

  const manifest = findHeadLink(headTags, "manifest");
  assert.equal(
    manifest?.attributes?.href,
    withBaseUrl(config.baseUrl, "manifest.webmanifest")
  );
});

test("static root exposes app icon fallbacks and web manifest", async () => {
  await fs.access(path.join(staticRoot, "apple-touch-icon.png"));

  const manifest = JSON.parse(
    await fs.readFile(path.join(staticRoot, "manifest.webmanifest"), "utf8")
  );

  assert.equal(manifest.name, "React on Rails");
  assert.equal(manifest.short_name, "React on Rails");
  assert.equal(manifest.start_url, ".");
  assert.equal(manifest.scope, ".");
  assert.equal(manifest.display, "standalone");

  assert.deepEqual(
    manifest.icons.map((icon) => ({
      src: icon.src,
      sizes: icon.sizes,
      type: icon.type,
    })),
    [
      {
        src: "img/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "img/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ]
  );
});
