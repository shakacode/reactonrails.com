# AGENTS.md

Instructions for AI coding agents working on the reactonrails.com documentation site.

This is a Docusaurus site that publishes documentation for [React on Rails](https://github.com/shakacode/react_on_rails). Canonical docs live in the `react_on_rails` monorepo (`docs/`); this repo fetches them at build time, transforms them for Docusaurus, and deploys to Cloudflare Pages.

## Reusable Workflows

- `AGENTS.md`: canonical entry point for agent instructions and workflow discovery
- `.claude/commands/`: Claude Code slash commands
- `.agents/workflows/`: shared prompt templates and reusable workflows for Codex, GPT, and other non-Claude tools
- When the user asks to address PR review comments outside Claude slash commands, follow `.agents/workflows/address-review.md`

## Canonical Agent Policy

`AGENTS.md` is the canonical source for repository-wide agent rules:

- Commands and build workflow
- Code style and formatting expectations
- Git/PR boundaries and safety rules
- Project structure

Other agent-facing docs (for example `CLAUDE.md`) should contain only tool-specific workflow notes and link back here.
If there is a conflict, `AGENTS.md` wins.

## Commands

```bash
# Sync docs from react_on_rails monorepo
npm run sync:docs                    # Full sync
npm run sync:docs:subset             # Subset sync (faster for dev)

# Prepare docs for Docusaurus
npm run prepare:docs                 # Full prepare
npm run prepare:docs:subset          # Subset prepare

# Full prepare pipeline
npm run prepare                      # sync + prepare
npm run prepare:subset               # sync:subset + prepare:subset

# Install Docusaurus dependencies
npm run install:site

# Development server
npm run dev                          # Start Docusaurus dev server

# Build
npm run build                        # Build Docusaurus site
npm run build:full                   # prepare + build (end-to-end)

# Deploy
npm run cloudflare:deploy            # Full build + deploy to Cloudflare Pages
```

## Project Structure

| Path                          | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `scripts/`                    | Build scripts (sync-docs, prepare-docs)                  |
| `prototypes/docusaurus/`      | Docusaurus site (config, theme, static assets)           |
| `prototypes/docusaurus/docs/` | Generated docs directory (gitignored, built from sync)   |
| `content/upstream/docs/`      | Synced upstream docs (gitignored)                        |
| `.github/workflows/`          | CI/CD (site build and deploy)                            |
| `.claude/commands/`           | Claude Code slash commands                               |
| `.agents/workflows/`          | Shared prompt templates for non-Claude tools             |

## Content Flow

```
react_on_rails/docs  -->  content/upstream/docs  -->  prototypes/docusaurus/docs  -->  build/deploy
```

1. `npm run sync:docs` copies docs from the monorepo into `content/upstream/docs`
2. `npm run prepare:docs` hydrates the Docusaurus docs directory
3. Docusaurus builds static output at `prototypes/docusaurus/build`
4. Cloudflare Pages deploys the static output

## Code Style

- Use `npm` for all operations (not `pnpm` or `yarn`)
- Ensure all files end with a newline
- Follow existing patterns in scripts and configuration

## Git Workflow

**Branch naming**: `type/descriptive-name` (e.g., `fix/docs-nav-ordering`)

**Commit messages**: Explain why, not what. One logical change per commit.

**PR creation**: Use `gh pr create` with a clear title, summary, and test plan.

## Review Workflow

- Use at most one AI reviewer that leaves inline comments
- Wait for the first full review pass to finish before pushing follow-up commits
- Batch review fixes into one follow-up push when practical
- Treat as blocking only: correctness bugs, broken builds, regressions, and clear inconsistencies
- Verify claims locally before changing code in response to AI review comments
- Deduplicate repeated bot comments before acting on them
- When asking an agent to address review comments, instruct it to classify comments into `blocking`, `optional`, and `noise`, then apply only the `blocking` items plus any explicitly selected optional items

## Boundaries

### Always

- Test builds locally before pushing (`npm run build`)
- Ensure all files end with a newline
- Use `npm` for all operations

### Ask First

- Destructive git operations (force push, reset --hard, branch deletion)
- Changes to CI workflows (`.github/workflows/`)
- Changes to build scripts (`scripts/`)
- Changes to Docusaurus configuration (`prototypes/docusaurus/docusaurus.config.ts`)

### Never

- Skip pre-commit hooks (`--no-verify`)
- Commit secrets, credentials, or `.env` files
- Edit synced docs directly in `content/upstream/docs/` or `prototypes/docusaurus/docs/` (these are gitignored and regenerated)
- Force push to `main`
