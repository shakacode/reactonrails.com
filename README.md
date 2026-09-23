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

## Versioned Documentation

The canonical `/docs/` route publishes the current stable React on Rails 17
documentation. The `/docs/16/` route publishes the archived React on Rails 16
documentation, including the OSS and Pro guides captured from the final stable
v16 release, `v16.6.0` (`1595fb8d823ffbc06d2f05ac7364b56f4c6c5aca`).

The version selector and the archived-version banner are configured in
`prototypes/docusaurus/docusaurus.config.ts`. Algolia uses Docusaurus
contextual search so results stay within the selected documentation version.
Local search remains the fallback when the Algolia environment is absent.

For the next major release, archive the outgoing stable docs before changing
the configured stable label:

1. Check out the final stable release tag in a temporary `react_on_rails`
   checkout.
2. Run `REACT_ON_RAILS_REPO=/absolute/path/to/checkout npm run sync:docs`.
3. Run `npm run prepare:docs`.
4. Run `npm --prefix prototypes/docusaurus run docusaurus docs:version MAJOR`.
5. Restore the current docs with `npm run prepare`, then update the `versions`
   configuration, source-tag mapping, redirects, and this policy.
6. Run `npm run test:algolia-config` and `npm run build`. Verify the stable and
   archived routes, version selector, banner, and version-scoped search in the
   preview deployment.

Keep one archived major. Do not publish a separate prerelease or `next` version
unless a release owner intentionally adds it to the Docusaurus configuration.

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
