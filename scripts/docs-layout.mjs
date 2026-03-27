import fs from "node:fs/promises";
import path from "node:path";

export const docsSubsetEntries = [
  {kind: "root", relativePath: "README.md"},
  {kind: "oss", relativePath: "introduction.md"},
  {kind: "oss", relativePath: "getting-started/quick-start.md"},
  {kind: "oss", relativePath: "getting-started/tutorial.md"},
  {kind: "oss", relativePath: "getting-started/installation-into-an-existing-rails-app.md"},
  {kind: "oss", relativePath: "core-concepts/how-react-on-rails-works.md"},
  {kind: "oss", relativePath: "core-concepts/react-server-rendering.md"},
  {kind: "oss", relativePath: "api-reference/view-helpers-api.md"},
  {kind: "oss", relativePath: "building-features/react-and-redux.md"},
  {kind: "oss", relativePath: "deployment/README.md"},
  {kind: "oss", relativePath: "upgrading/upgrading-react-on-rails.md"},
  {kind: "pro", relativePath: "react-on-rails-pro.md"},
  {kind: "pro", relativePath: "home-pro.md"},
  {kind: "pro", relativePath: "node-renderer/basics.md"},
  {kind: "pro", relativePath: "react-server-components/tutorial.md"},
];

export async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function detectDocsLayout(docsRoot) {
  const splitRoot = path.join(docsRoot, "oss");
  const readmePath = path.join(docsRoot, "README.md");

  if (await exists(splitRoot)) {
    return "split";
  }

  if (await exists(readmePath)) {
    return "consolidated";
  }

  throw new Error(`Unable to detect docs layout in ${docsRoot}`);
}

export function subsetPathsForLayout(layout) {
  return docsSubsetEntries.map((entry) => {
    if (entry.kind === "root") {
      return entry.relativePath;
    }

    if (entry.kind === "pro") {
      return path.posix.join("pro", entry.relativePath);
    }

    if (layout === "split") {
      return path.posix.join("oss", entry.relativePath);
    }

    return entry.relativePath;
  });
}

export function docsLayoutPaths(docsRoot, layout) {
  if (layout === "split") {
    return {
      layout,
      contentRoot: path.join(docsRoot, "oss"),
      proDocsRoot: path.join(docsRoot, "pro"),
      imagesRoot: path.join(docsRoot, "images"),
      assetsRoot: path.join(docsRoot, "assets"),
      readmePath: path.join(docsRoot, "README.md"),
    };
  }

  return {
    layout,
    contentRoot: docsRoot,
    proDocsRoot: path.join(docsRoot, "pro"),
    imagesRoot: path.join(docsRoot, "images"),
    assetsRoot: path.join(docsRoot, "assets"),
    readmePath: path.join(docsRoot, "README.md"),
  };
}

export function excludeNamesForRootCopy(layout) {
  if (layout === "consolidated") {
    return new Set(["pro", "images", "assets"]);
  }

  return new Set();
}
