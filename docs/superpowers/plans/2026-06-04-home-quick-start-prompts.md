# Home Quick Start AI Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page Quick Start command cards with copy-able, doc-grounded AI-agent prompt cards (RSC first), and add a `/prompts` page hosting the full prompt library.

**Architecture:** A single data module (`src/constants/prompts.ts`) is the source of truth for every prompt and for the curated home-page subset. A reusable `PromptCard` component renders a prompt with a clipboard copy button and an "Open guide →" link. The home `QuickStartSection` and a new `/prompts` page both consume that data + component, mirroring the existing `demos.ts` / `DemoCard` / `examples.tsx` pattern.

**Tech Stack:** Docusaurus 3 (React + TypeScript), CSS Modules. Spec: `docs/superpowers/specs/2026-06-04-home-quick-start-prompts-design.md`.

### Verification model (read first)

This repo has **no JS unit-test framework** (no jest/vitest/testing-library) and existing components (`DemoCard`) ship untested. Per `AGENTS.md` ("follow existing patterns"), this plan does **not** introduce a test runner. Verification per task is:

- **Typecheck (fast gate, no docs sync needed):** `npm --prefix prototypes/docusaurus run typecheck` → expect `tsc` to exit 0 with no output.
- **Visual check (where noted):** `npm run dev` (from repo root) → open `http://localhost:3000`.
- **Final full build:** `npm run build:full` (from repo root) → expect a successful build with no new broken-link errors.

All `git` commands run from the repo root: `/Users/justin/conductor/workspaces/reactonrails.com/santiago-v9`. All paths below are relative to `prototypes/docusaurus/` unless noted.

---

### Task 1: Prompt data module

Source of truth for prompts, the curated home subset, the page category groups, and the shared agent note. Only ✅ confirmed-URL prompts (per spec v1 scope).

**Files:**
- Create: `prototypes/docusaurus/src/constants/prompts.ts`
- Reference (do not edit): `prototypes/docusaurus/src/constants/docsRoutes.ts`

- [ ] **Step 1: Write `prompts.ts`**

```ts
import {docsRoutes} from './docsRoutes';

/** Canonical site origin; matches `url` in docusaurus.config.ts. */
export const SITE_URL = 'https://reactonrails.com';

/** Shown once per surface (home Quick Start + /prompts hero). */
export const agentNote =
  "Paste into Cursor, Claude Code, Copilot, or any AI assistant. Each prompt points the agent at the official docs so it doesn't guess.";

export type PromptCategory =
  | 'get-started'
  | 'server-rendering'
  | 'migrate'
  | 'features'
  | 'production';

export type Prompt = {
  /** Stable slug; used as React key and to select the homepage subset. */
  id: string;
  title: string;
  /** Copy-able prompt text. Embeds an absolute docs URL so the agent grounds itself. */
  prompt: string;
  /** Docs route the "Open guide →" link points to (relative; from docsRoutes). */
  href: string;
  category: PromptCategory;
};

/** Absolute docs URL embedded in prompt text so agents fetch the real guide. */
function docUrl(route: string): string {
  return `${SITE_URL}${route}`;
}

export const prompts: Prompt[] = [
  {
    id: 'turn-on-rsc',
    title: 'Turn on React Server Components',
    prompt: `Turn on React Server Components in my React on Rails app (no license required). Follow ${docUrl(
      docsRoutes.proReactServerComponents,
    )} exactly, including the renderer and packer setup it specifies.`,
    href: docsRoutes.proReactServerComponents,
    category: 'server-rendering',
  },
  {
    id: 'create-app',
    title: 'Start a new app',
    prompt: `Set up a new Rails app with React on Rails, using TypeScript and server-side rendering. Follow the official guide at ${docUrl(
      docsRoutes.createApp,
    )} and use the exact commands and versions it specifies — don't improvise.`,
    href: docsRoutes.createApp,
    category: 'get-started',
  },
  {
    id: 'install-existing',
    title: 'Add to an existing Rails app',
    prompt: `Add React on Rails to my existing Rails app with TypeScript, keeping my current routes and conventions. Follow ${docUrl(
      docsRoutes.installExistingApp,
    )} and don't change any gem or package versions it doesn't tell you to.`,
    href: docsRoutes.installExistingApp,
    category: 'get-started',
  },
  {
    id: 'streaming-ssr',
    title: 'Add streaming SSR',
    prompt: `Add streaming server-side rendering to my React on Rails app. Follow ${docUrl(
      docsRoutes.proStreamingSsr,
    )} exactly and don't change versions it doesn't ask you to.`,
    href: docsRoutes.proStreamingSsr,
    category: 'server-rendering',
  },
  {
    id: 'async-rendering',
    title: 'Use async/Suspense rendering',
    prompt: `Set up async (Suspense) rendering for a React on Rails component. Follow ${docUrl(
      docsRoutes.proAsyncRendering,
    )} exactly.`,
    href: docsRoutes.proAsyncRendering,
    category: 'server-rendering',
  },
  {
    id: 'migrate-react-rails',
    title: 'Migrate from react-rails',
    prompt: `Migrate my app from react-rails to React on Rails, keeping my existing components working. Follow ${docUrl(
      docsRoutes.migrateFromReactRails,
    )} and don't skip any step it lists.`,
    href: docsRoutes.migrateFromReactRails,
    category: 'migrate',
  },
  {
    id: 'code-splitting',
    title: 'Add code splitting',
    prompt: `Add code splitting / lazy loading to my React on Rails components. Follow ${docUrl(
      docsRoutes.codeSplitting,
    )} exactly.`,
    href: docsRoutes.codeSplitting,
    category: 'features',
  },
  {
    id: 'oss-vs-pro',
    title: 'Evaluate OSS vs Pro',
    prompt: `Review my React on Rails setup and tell me whether OSS or Pro fits my workload, citing the tradeoffs. Base your answer on ${docUrl(
      docsRoutes.ossVsPro,
    )}.`,
    href: docsRoutes.ossVsPro,
    category: 'production',
  },
  {
    id: 'node-renderer',
    title: 'Set up the Node renderer',
    prompt: `Set up the React on Rails Pro Node renderer for server rendering. Follow ${docUrl(
      docsRoutes.proNodeRenderer,
    )} exactly, including the configuration it specifies.`,
    href: docsRoutes.proNodeRenderer,
    category: 'production',
  },
  {
    id: 'fragment-caching',
    title: 'Add fragment caching',
    prompt: `Add fragment caching to my server-rendered React on Rails components. Follow ${docUrl(
      docsRoutes.proFragmentCaching,
    )} exactly.`,
    href: docsRoutes.proFragmentCaching,
    category: 'production',
  },
  {
    id: 'upgrade-to-pro',
    title: 'Get a production license / upgrade to Pro',
    prompt: `Walk me through upgrading my React on Rails app to Pro and getting a production license. Follow ${docUrl(
      docsRoutes.proUpgrade,
    )}.`,
    href: docsRoutes.proUpgrade,
    category: 'production',
  },
];

/** Curated, ordered subset for the home Quick Start: RSC first (marquee). */
const homePromptIds = ['turn-on-rsc', 'create-app', 'install-existing'] as const;

export const homePrompts: Prompt[] = homePromptIds.map((id) => {
  const found = prompts.find((prompt) => prompt.id === id);
  if (!found) {
    throw new Error(`homePromptIds references unknown prompt id: ${id}`);
  }
  return found;
});

export type PromptGroup = {
  category: PromptCategory;
  eyebrow: string;
  heading: string;
};

/** Display order of categories on /prompts. */
export const promptGroups: PromptGroup[] = [
  {category: 'get-started', eyebrow: 'Get started', heading: 'Spin up React on Rails.'},
  {
    category: 'server-rendering',
    eyebrow: 'Server rendering',
    heading: 'Render on the server: RSC, SSR, streaming.',
  },
  {category: 'migrate', eyebrow: 'Migrate', heading: 'Move an existing setup to React on Rails.'},
  {category: 'features', eyebrow: 'Build features', heading: 'Add common capabilities.'},
  {
    category: 'production',
    eyebrow: 'Optimize & go to production',
    heading: 'Tune performance and ship with Pro.',
  },
];
```

- [ ] **Step 2: Typecheck**

Run: `npm --prefix prototypes/docusaurus run typecheck`
Expected: exits 0, no errors. (Confirms `docsRoutes` keys referenced all exist and types line up.)

- [ ] **Step 3: Commit**

```bash
git add prototypes/docusaurus/src/constants/prompts.ts
git commit -m "Add prompt data module for AI quick-start prompts"
```

---

### Task 2: PromptCard component

Reusable card: title, prompt text, copy-to-clipboard button, and guide link. Mirrors `src/components/DemoCard/`.

**Files:**
- Create: `prototypes/docusaurus/src/components/PromptCard/index.tsx`
- Create: `prototypes/docusaurus/src/components/PromptCard/styles.module.css`

- [ ] **Step 1: Write `index.tsx`**

```tsx
import {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';

import type {Prompt} from '../../constants/prompts';
import styles from './styles.module.css';

export default function PromptCard({prompt}: {prompt: Prompt}): ReactNode {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Clipboard API can be unavailable (insecure context / denied permission).
      // The prompt text is visible on the card, so the user can still select it.
      // Surface the reason instead of failing silently.
      console.warn('Copy to clipboard failed:', error);
    }
  }

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{prompt.title}</h3>
      <p className={styles.prompt}>{prompt.prompt}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.copyButton} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
        <Link className={styles.guideLink} to={prompt.href}>
          Open guide →
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Write `styles.module.css`**

```css
.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  border: 1px solid var(--site-border);
  border-radius: 8px;
  background: var(--site-surface);
  padding: 0.95rem;
}

.title {
  margin-bottom: 0.55rem;
  line-height: 1.12;
}

.prompt {
  flex: 1;
  margin: 0 0 0.9rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--site-border);
  border-left: 3px solid var(--ifm-color-primary);
  border-radius: 6px;
  background: var(--site-inline-code-surface);
  color: var(--ifm-color-content);
  font-size: 0.92rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.copyButton {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--site-border);
  border-radius: 6px;
  background: var(--site-soft-surface);
  color: var(--ifm-color-content);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.copyButton:hover {
  border-color: var(--ifm-color-primary);
}

.guideLink {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}
```

- [ ] **Step 3: Typecheck**

Run: `npm --prefix prototypes/docusaurus run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add prototypes/docusaurus/src/components/PromptCard/
git commit -m "Add PromptCard component with copy-to-clipboard"
```

---

### Task 3: `/prompts` page

Grouped library page. Mirrors `src/pages/examples.tsx` + `examples.module.css`.

**Files:**
- Create: `prototypes/docusaurus/src/pages/prompts.tsx`
- Create: `prototypes/docusaurus/src/pages/prompts.module.css`

- [ ] **Step 1: Write `prompts.tsx`**

```tsx
import type {ReactNode} from 'react';
import Layout from '@theme/Layout';

import {agentNote, prompts, promptGroups} from '../constants/prompts';
import PromptCard from '../components/PromptCard';
import styles from './prompts.module.css';

export default function PromptsPage(): ReactNode {
  return (
    <Layout
      title="Prompts"
      description="Copy-able AI prompts for setting up and building with React on Rails.">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>AI prompts</p>
            <h1>Start React on Rails with your AI assistant.</h1>
            <p className={styles.lead}>{agentNote}</p>
          </div>
        </section>

        {promptGroups.map((group) => {
          const groupPrompts = prompts.filter((prompt) => prompt.category === group.category);
          if (groupPrompts.length === 0) {
            return null;
          }
          return (
            <section className="container" key={group.category}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>{group.eyebrow}</p>
                <h2>{group.heading}</h2>
              </div>
              <div className={styles.grid}>
                {groupPrompts.map((prompt) => (
                  <PromptCard prompt={prompt} key={prompt.id} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </Layout>
  );
}
```

- [ ] **Step 2: Write `prompts.module.css`**

```css
.main {
  padding-bottom: 2.6rem;
}

.hero {
  padding: 2.6rem 0 2rem;
  margin-bottom: 1.6rem;
  border-bottom: 1px solid var(--site-border);
  background: var(--site-soft-surface);
}

.kicker,
.sectionEyebrow {
  margin: 0 0 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.06rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ifm-color-primary-dark);
}

.lead {
  max-width: 42rem;
  font-size: 1.02rem;
  color: var(--ifm-color-content-secondary);
}

.sectionHeader {
  max-width: 38rem;
  margin-bottom: 0.85rem;
}

.sectionHeader h2 {
  margin-bottom: 0;
}

.grid {
  margin-bottom: 1.6rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

@media (max-width: 996px) {
  .hero {
    padding: 2.1rem 0 1.7rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npm --prefix prototypes/docusaurus run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add prototypes/docusaurus/src/pages/prompts.tsx prototypes/docusaurus/src/pages/prompts.module.css
git commit -m "Add /prompts page with grouped prompt library"
```

---

### Task 4: Add Prompts navbar item

Discoverability, mirroring the existing Examples entry.

**Files:**
- Modify: `prototypes/docusaurus/docusaurus.config.ts` (navbar `items`, right after the Examples entry)

- [ ] **Step 1: Add the navbar item**

Find this line:

```ts
        {to: '/examples', label: 'Examples', position: 'left'},
```

Add a new line immediately after it:

```ts
        {to: '/examples', label: 'Examples', position: 'left'},
        {to: '/prompts', label: 'Prompts', position: 'left'},
```

- [ ] **Step 2: Typecheck**

Run: `npm --prefix prototypes/docusaurus run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add prototypes/docusaurus/docusaurus.config.ts
git commit -m "Add Prompts link to navbar"
```

---

### Task 5: Refactor home Quick Start to prompt cards

Replace the command-based cards with `PromptCard`s driven by `homePrompts`, add the tool-agnostic note and a "Browse all prompts →" link, and remove the CSS this orphans.

**Files:**
- Modify: `prototypes/docusaurus/src/pages/index.tsx`
- Modify: `prototypes/docusaurus/src/pages/index.module.css`

- [ ] **Step 1: Update imports in `index.tsx`**

Find:

```ts
import {docsRoutes} from '../constants/docsRoutes';
import {featuredDemos} from '../constants/demos';
import DemoCard from '../components/DemoCard';
import styles from './index.module.css';
```

Replace with:

```ts
import {docsRoutes} from '../constants/docsRoutes';
import {featuredDemos} from '../constants/demos';
import {agentNote, homePrompts} from '../constants/prompts';
import DemoCard from '../components/DemoCard';
import PromptCard from '../components/PromptCard';
import styles from './index.module.css';
```

- [ ] **Step 2: Delete the `quickStartCards` array in `index.tsx`**

Delete this entire block (lines ~13-35):

```ts
const quickStartCards = [
  {
    title: 'Create App',
    command: 'npx create-react-on-rails-app@latest my-app',
    description: 'Scaffold a working Rails + React app with TypeScript defaults.',
    href: docsRoutes.createApp,
    cta: 'Open guide',
  },
  {
    title: 'Install Into Rails',
    command: 'bundle exec rails generate react_on_rails:install --typescript',
    description: 'Add React on Rails to an existing app while keeping Rails routes and conventions.',
    href: docsRoutes.installExistingApp,
    cta: 'Open guide',
  },
  {
    title: 'Upgrade To Pro',
    command: 'bundle add react_on_rails_pro',
    description: 'Evaluate Pro SSR, streaming, and RSC paths before buying a production license.',
    href: docsRoutes.proUpgrade,
    cta: 'Open guide',
  },
];
```

Note: `docsRoutes` is still used elsewhere in this file (ProSection, etc.), so keep its import.

- [ ] **Step 3: Replace `QuickStartSection` in `index.tsx`**

Find the existing `QuickStartSection` function:

```tsx
function QuickStartSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Quick Start</h2>
        </div>
        <div className={styles.quickStartGrid}>
          {quickStartCards.map((card) => (
            <article className={styles.quickStartCard} key={card.title}>
              <h3>{card.title}</h3>
              <code className={styles.inlineCode}>{card.command}</code>
              <p>{card.description}</p>
              <Link className={styles.cardLink} to={card.href}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Replace it with:

```tsx
function QuickStartSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader}>
            <h2>Quick Start</h2>
            <p className={styles.quickStartNote}>{agentNote}</p>
          </div>
          <Link className={styles.browseAll} to="/prompts">
            Browse all prompts →
          </Link>
        </div>
        <div className={styles.quickStartGrid}>
          {homePrompts.map((prompt) => (
            <PromptCard prompt={prompt} key={prompt.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add `.quickStartNote` and remove orphaned CSS in `index.module.css`**

First, add the note style. Find:

```css
.sectionHeader h2,
.sectionFeature h2 {
  margin-bottom: 0;
  font-size: clamp(1.75rem, 3.4vw, 2.4rem);
  line-height: 1.16;
}
```

Add immediately after it:

```css
.quickStartNote {
  max-width: 44rem;
  margin: 0.6rem 0 0;
  color: var(--ifm-color-content-secondary);
  font-size: 0.95rem;
}
```

Next, remove the now-orphaned `.inlineCode` rule (no longer referenced after Step 3). Delete this entire block:

```css
.inlineCode {
  box-sizing: border-box;
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0 0 0.8rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--site-border);
  border-radius: 6px;
  background: var(--site-inline-code-surface);
  color: var(--ifm-color-content);
  overflow-x: auto;
  white-space: nowrap;
}
```

Finally, drop the orphaned `.quickStartCard` selector from the three shared rules (the className is no longer applied anywhere; the shared rule bodies still serve `.valueCard`/`.migrationCard`/`.quoteCard`, so edit only the selector lines):

Change:

```css
.quickStartCard,
.valueCard,
.migrationCard,
.quoteCard {
```

to:

```css
.valueCard,
.migrationCard,
.quoteCard {
```

Change:

```css
.quickStartCard h3,
.valueCard h3,
.migrationCard h3 {
```

to:

```css
.valueCard h3,
.migrationCard h3 {
```

Change:

```css
.quickStartCard p,
.valueCard p,
.migrationCard p {
```

to:

```css
.valueCard p,
.migrationCard p {
```

Leave `.quickStartGrid` and `.cardLink` intact — `.quickStartGrid` still wraps the new cards; `.cardLink` is used by other sections (MigrationSection).

- [ ] **Step 5: Typecheck**

Run: `npm --prefix prototypes/docusaurus run typecheck`
Expected: exits 0, no errors. (Confirms no dangling references to the deleted `quickStartCards`.)

- [ ] **Step 6: Visual check**

Run (from repo root): `npm run dev`
Open `http://localhost:3000`. Confirm:
- Quick Start shows 3 prompt cards, **RSC first**, then Start a new app, then Add to an existing Rails app.
- The tool-agnostic note appears under the "Quick Start" heading.
- "Browse all prompts →" sits on the header row and navigates to `/prompts`.
- Clicking **Copy prompt** changes the label to "Copied" for ~2s and the clipboard holds the prompt text.
- The navbar **Prompts** link opens `/prompts`, which shows grouped sections.

Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add prototypes/docusaurus/src/pages/index.tsx prototypes/docusaurus/src/pages/index.module.css
git commit -m "Feature AI prompts in home Quick Start"
```

---

### Task 6: Full build verification

Confirm the production build succeeds and introduces no broken links (the new guide links reuse existing `docsRoutes`, and `/prompts` is a real route).

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run (from repo root): `npm run build:full`
Expected: build completes successfully; output includes a generated `/prompts` route; no broken-link errors referencing `/prompts` or the prompt guide links.

- [ ] **Step 2: If the build flags broken links**

Read the exact reported path. If a prompt's `href` points at a docs route that does not resolve in the prepared tree, that route is not part of v1 — either correct the `docsRoutes` value it maps to or remove that prompt from `prompts.ts`. Do not fabricate or guess a route. Re-run `npm run build:full`.

- [ ] **Step 3: Final commit (only if Step 2 required changes)**

```bash
git add -A
git commit -m "Fix prompt doc links surfaced by full build"
```

---

## Notes for the implementer

- **Adding ⚠️ prompts later** (first component, plain SSR, SPA→Rails, Redux, React Router, testing — see spec): add a route to `docsRoutes.ts`, verify it resolves via `npm run build:full`, then append a `Prompt` entry to `prompts.ts`. No component or page changes needed — the page and home subset pick up data-only additions.
- **End every file with a newline** (`AGENTS.md`).
- **Do not** introduce a JS test framework; this repo intentionally has none.
