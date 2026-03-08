# Cloudflare Pages Setup

## Current Status

- Pages project created: `reactonrails-com`
- Default hostname: `https://reactonrails-com.pages.dev/`

## Required GitHub Secrets

Set in `shakacode/reactonrails.com` repository settings:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional repository variable:

- `CLOUDFLARE_PAGES_PROJECT` (defaults to `reactonrails-com`)

## Manual Domain Step

Wrangler CLI does not currently expose custom-domain attach for Pages. Complete in Cloudflare dashboard:

1. Workers & Pages -> `reactonrails-com`
2. Custom domains -> `Set up a custom domain`
3. Add:
   - `reactonrails.com`
   - `www.reactonrails.com` (optional)

After domain setup, Cloudflare provisions TLS automatically.

## Redirect Strategy

Site-level redirects already configured in:

- `prototypes/docusaurus/static/_redirects`

Legacy host redirect from `https://www.shakacode.com/react-on-rails/docs/*` to `https://reactonrails.com/docs/*` must be added in the `sc-website` Cloudflare Pages project (or equivalent host-level redirect rules).
