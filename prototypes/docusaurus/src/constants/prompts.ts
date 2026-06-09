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
