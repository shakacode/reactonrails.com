# reactonrails.com Architecture

## Decision

Use a hybrid model:

- Canonical docs remain in the `react_on_rails` monorepo (`docs/`)
- `reactonrails.com` is a dedicated site repo
- Site fetches docs content at build time

## Framework

Selected framework: **Docusaurus**.

Starlight was used only during evaluation and is not part of production flow.

## Content Flow

```
react_on_rails/docs  -->  content/upstream/docs  -->  prototypes/docusaurus/docs  -->  build/deploy
```

1. `npm run sync:docs` copies docs from monorepo into `content/upstream/docs`
2. `npm run prepare:docs` hydrates Docusaurus docs directory
3. Docusaurus builds static output at `prototypes/docusaurus/build`
4. Cloudflare Pages deploys the static output

## Deployment Target

- Cloudflare Pages project: `reactonrails-com`
- Default hostname: `https://reactonrails-com.pages.dev/`
- Intended custom domain: `https://reactonrails.com/`

## Redirects

`prototypes/docusaurus/static/_redirects` includes legacy path redirects:

- `/react-on-rails/docs/*` -> `/docs/:splat`
- `/react-on-rails/docs` -> `/docs`

This supports cutover from old URL paths after DNS/domain routing is in place.
