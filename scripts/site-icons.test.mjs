import assert from "node:assert/strict";
import fs from "node:fs/promises";
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

test("Docusaurus head advertises high resolution app icons", async () => {
  const configSource = await fs.readFile(docusaurusConfigPath, "utf8");

  assert.match(configSource, /headTags:\s*\[/);
  assert.match(configSource, /rel:\s*['"]apple-touch-icon['"]/);
  assert.match(configSource, /href:\s*['"]\/img\/icon-192\.png['"]/);
  assert.match(configSource, /rel:\s*['"]manifest['"]/);
  assert.match(configSource, /href:\s*['"]\/manifest\.webmanifest['"]/);
});

test("static root exposes app icon fallbacks and web manifest", async () => {
  await fs.access(path.join(staticRoot, "apple-touch-icon.png"));

  const manifest = JSON.parse(
    await fs.readFile(path.join(staticRoot, "manifest.webmanifest"), "utf8")
  );

  assert.equal(manifest.name, "React on Rails");
  assert.equal(manifest.short_name, "React on Rails");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");

  assert.deepEqual(
    manifest.icons.map((icon) => ({
      src: icon.src,
      sizes: icon.sizes,
      type: icon.type,
    })),
    [
      {
        src: "/img/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/img/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ]
  );
});
