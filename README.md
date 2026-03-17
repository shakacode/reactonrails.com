# reactonrails.com

Production site workspace for [reactonrails.com](https://reactonrails.com), built with Docusaurus.

## Architecture

- Canonical markdown source stays in `react_on_rails/docs/`
- This repo syncs docs at build time into `prototypes/docusaurus/docs`
- Site-owned pages live here (landing page, examples, Pro page)
- Pro docs are public under `docs/pro/`

## Docs Ownership Rules

- Treat `react_on_rails/docs/` as the source of truth for canonical docs content.
- Keep `reactonrails.com` focused on site presentation, navigation, homepage/examples pages, and sync/prepare transforms.
- Do not add canonical docs markdown under `content/overrides/docs/` as a steady-state pattern.
- If a temporary site-side docs override is absolutely required to decouple merge order, document that in the PR, keep the diff minimal, and remove it as soon as the upstream `react_on_rails` change merges.
- Before adding a new doc page or link in this repo, check whether the canonical page already exists in `react_on_rails/docs/`.
- When wiring site links, verify the prepared slug under `prototypes/docusaurus/docs/`; do not assume the upstream filename maps 1:1 to the public route.

## Docs Change Workflow

1. Put new or revised canonical docs content in `react_on_rails/docs/`.
2. Use this repo only for site-specific UX work:
   - homepage/examples/Pro pages
   - nav/sidebar/footer structure
   - sync/prepare transforms
   - styling and Docusaurus behavior
3. Run `npm run prepare` after upstream docs changes so the prepared site tree reflects the current source.
4. Run `npm run build` and, for broader docs work, `npm run audit:docs`.
5. Merge content-bearing `react_on_rails` PRs before or alongside dependent `reactonrails.com` PRs.

## Local Development

1. Install site dependencies:
   - `npm run install:site`
2. Sync docs from monorepo and prepare local docs tree:
   - `npm run prepare`
3. Run the site:
   - `npm run dev`
4. Run docs validation scan:
   - `npm run audit:docs`

## Build

- Build from prepared docs:
  - `npm run build`
- Full build from fresh docs sync:
  - `npm run build:full`

## Docs Sync Source Resolution

`scripts/sync-docs.mjs` resolves the monorepo in this order:

1. `REACT_ON_RAILS_REPO` env var
2. sibling directory `../react_on_rails`
3. shallow clone from `REACT_ON_RAILS_REPO_URL` (default: upstream GitHub repo)

## Legacy Archive Handling

`scripts/prepare-docs.mjs` applies a deterministic cleanup pass after sync:

- fixes known broken anchors/links
- normalizes a few outdated docs references
- moves selected legacy docs to `docs/archive/legacy/`
- leaves stub pages at original routes pointing to archived content and modern replacements

## Cloudflare Pages

- Project: `reactonrails-com`
- Build output directory: `prototypes/docusaurus/build`
- One-off deploy from local machine:
  - `npm run cloudflare:deploy`

For GitHub Actions deploy, configure these repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional repository variable:
- `CLOUDFLARE_PAGES_PROJECT` (defaults to `reactonrails-com`)
