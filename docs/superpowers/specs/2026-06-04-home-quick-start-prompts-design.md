# Home Quick Start AI Prompts — Design

Date: 2026-06-04
Status: Approved (brainstorm); pending implementation plan

## Problem

The home page **Quick Start** section currently shows three cards, each anchored on a
shell command (`npx create-react-on-rails-app`, `bundle exec rails generate
react_on_rails:install`, `bundle add react_on_rails_pro`). Developers increasingly start
and modify projects through AI coding agents (Claude Code, Cursor, Copilot, etc.). We want
the Quick Start to feature **copy-able AI prompts** instead, and to add a dedicated
`/prompts` page that hosts a fuller prompt library.

## Goals

- Replace the home Quick Start command cards with AI-agent prompt cards.
- Lead with React Server Components (RSC) as the marquee prompt.
- Add a browsable `/prompts` page grouping prompts by developer intent.
- Make prompts agent-agnostic and grounded: each prompt points the agent at the official
  doc URL so it follows real, version-correct instructions instead of guessing.

## Non-Goals / Out of Scope

- No per-agent deep-link buttons ("Open in Cursor", etc.). A single copy button plus a
  tool-agnostic note is the v1 interaction.
- No `llms.txt` / AI rules file for the framework. (Noted as a future opportunity; prompts
  are self-contained for now precisely because no such file exists yet.)
- No fabricated doc URLs. Prompts ship only with verified links (see URL Verification).

## Key Decisions

| Decision | Choice |
| --- | --- |
| What "prompts" means | AI coding-agent prompts (paste into Claude Code / Cursor / Copilot / any assistant) |
| Home-page scope | Keep 3 cards; reframe around intent; lead with RSC |
| Prompt anatomy | **Goal + authoritative doc link** (grounded one/two-sentence prompt) |
| Interaction | Single **Copy prompt** button + a "works with any agent" note |
| Second surface | A full `/prompts` page library, linked from the home Quick Start |
| RSC license wording | State **"(no license required)"** flatly — simplest |
| Home card order | **RSC first** (marquee), then new app, then existing app |
| `/prompts` v1 scope | Ship confirmed-URL prompts only; add others as URLs are verified |

## Prompt Anatomy

Each prompt is short and grounded:

1. **Goal** — what the developer wants done, in plain language.
2. **Doc link** — the exact `https://reactonrails.com/docs/...` URL to follow.
3. **Grounding guard** — a short instruction to follow the doc exactly and not improvise
   versions/commands.

Shared note shown once per section (home and `/prompts`):

> Paste into Cursor, Claude Code, Copilot, or any AI assistant. Each prompt points the
> agent at the official docs so it doesn't guess.

## Home Page — Quick Start Section

Same three-card grid as today. Each card has: title, prompt text in a quote/code block, a
**Copy prompt** button, and an "Open guide →" link to the same doc. The section keeps the
"Quick Start" heading, adds the shared tool-agnostic note, and gains a **"Browse all
prompts →"** link to `/prompts` (mirroring how Live Demos links to `/examples`).

**Card 1 — Turn on React Server Components** (marquee, first)
> Turn on React Server Components in my React on Rails app (no license required). Follow
> https://reactonrails.com/docs/pro/react-server-components exactly, including the renderer
> and packer setup it specifies.

**Card 2 — Start a new app**
> Set up a new Rails app with React on Rails, using TypeScript and server-side rendering.
> Follow the official guide at
> https://reactonrails.com/docs/getting-started/create-react-on-rails-app and use the exact
> commands and versions it specifies — don't improvise.

**Card 3 — Add to an existing Rails app**
> Add React on Rails to my existing Rails app with TypeScript, keeping my current routes and
> conventions. Follow https://reactonrails.com/docs/getting-started/existing-rails-app and
> don't change any gem or package versions it doesn't tell you to.

## `/prompts` Page — Full Library

A browsable page of copy-able prompts grouped by intent. Same card anatomy and shared note
as the home page, plus a short intro line. The three home cards are a curated subset that
also appear here.

Categories and prompts (✅ = doc route confirmed in `docsRoutes`; ⚠️ = valuable prompt that
needs a verified doc URL before shipping):

**Get started**
- ✅ Start a new React on Rails app — `/docs/getting-started/create-react-on-rails-app`
- ✅ Add React on Rails to an existing Rails app — `/docs/getting-started/existing-rails-app`
- ⚠️ Render your first React component in a Rails view

**Server rendering**
- ✅ Turn on React Server Components (no license required) — `/docs/pro/react-server-components`
- ⚠️ Turn on server-side rendering (SSR)
- ✅ Add streaming SSR — `/docs/pro/streaming-ssr`
- ✅ Use async/Suspense rendering — `/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options--`

**Migrate**
- ✅ Migrate from react-rails — `/docs/migrating/migrating-from-react-rails`
- ⚠️ Move a standalone React SPA into Rails

**Build features**
- ✅ Add code splitting / lazy loading — `/docs/building-features/code-splitting`
- ⚠️ Add Redux (or other state management)
- ⚠️ Add React Router
- ⚠️ Set up component testing

**Optimize & go to production**
- ✅ Evaluate OSS vs Pro for my workload — `/docs/getting-started/oss-vs-pro`
- ✅ Set up the Node renderer — `/docs/pro/node-renderer`
- ✅ Add fragment caching — `/docs/pro/fragment-caching`
- ✅ Get a production license / upgrade to Pro — `/docs/pro/upgrading-to-pro`

**v1 ships the ✅ prompts.** ⚠️ prompts are added as their canonical doc URLs are confirmed
against the prepared docs tree. If a page does not exist, point at the closest guide or drop
the prompt — never fabricate a link.

## Implementation Notes (non-binding; for the plan)

Follows existing home-page / examples patterns:

- A constants module (e.g. `src/constants/prompts.ts`) defines prompt entries
  `{ id, title, prompt, href, category }`. The home cards reference a curated subset by id.
- A reusable `PromptCard` component (parallel to `DemoCard`) renders title, prompt text,
  copy button, and the guide link.
- A copy button using `navigator.clipboard.writeText` with a "Copied" state. Guard for
  SSR/availability; this is a client-only interaction.
- `QuickStartSection` in `src/pages/index.tsx` is refactored to render `PromptCard`s and the
  "Browse all prompts →" link.
- A new `src/pages/prompts.tsx` renders the grouped library, reusing `PromptCard`.
- Build doc URLs from a single base (`https://reactonrails.com`) + the existing `docsRoutes`
  values so card links and embedded prompt URLs stay in sync.

## URL Verification

Before writing the final text of any prompt, confirm its doc URL resolves in the prepared
docs tree. ✅ items map to entries already in `src/constants/docsRoutes.ts`. ⚠️ items must be
verified (or have routes added to `docsRoutes`) before they ship.

## Open Follow-ups

- Confirm canonical doc pages for the ⚠️ prompts (first component, plain SSR, SPA→Rails,
  Redux, React Router, testing).
- Consider whether to publish an `llms.txt` later so prompts can additionally reference a
  single authoritative context file.
