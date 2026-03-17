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

### Site-level redirects (this repo)

Configured in `prototypes/docusaurus/static/_redirects`:

- `/react-on-rails/docs/*` → `/docs/*` (301)
- `/react-on-rails-pro/docs/*` → `/docs/*` (301)

### Legacy host redirects (shakacode.com Cloudflare project)

These must be added in the `sc-website` Cloudflare Pages project (or via Cloudflare Redirect Rules on the shakacode.com zone):

| Source | Destination | Status |
|--------|-------------|--------|
| `www.shakacode.com/react-on-rails/docs/*` | `https://reactonrails.com/docs/*` | 301 |
| `www.shakacode.com/react-on-rails-pro/docs/*` | `https://reactonrails.com/docs/*` | 301 |

To set up via Cloudflare Dashboard:

1. Go to the shakacode.com zone → Rules → Redirect Rules
2. Create a rule for each pattern above using dynamic redirects
3. Use expression: `(http.host eq "www.shakacode.com" and starts_with(http.request.uri.path, "/react-on-rails/docs"))`
4. Set destination: `concat("https://reactonrails.com/docs", substring(http.request.uri.path, 21))` (strips `/react-on-rails/docs` prefix)
5. Repeat for `/react-on-rails-pro/docs` with appropriate path offset

Verify by visiting old shakacode.com doc URLs and confirming 301 redirects to reactonrails.com.
