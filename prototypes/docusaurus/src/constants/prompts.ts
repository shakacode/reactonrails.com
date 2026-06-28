/*
 * GENERATED FILE - DO NOT EDIT.
 * Source: content/upstream/prompts.yml
 * Regenerate with `npm run prepare:prompts`.
 */
export const SITE_URL = "https://reactonrails.com";

export const agentNote = "Paste into Cursor, Claude Code, Copilot, or any AI assistant. Each prompt points the agent at the official docs so it doesn't guess.";

export type PromptCategory =
  | "get-started"
  | "server-rendering"
  | "migrate"
  | "features"
  | "production";

export type Prompt = {
  id: string;
  title: string;
  prompt: string;
  href: string;
  category: PromptCategory;
};

export const prompts: Prompt[] = [
  {
    "id": "create-app",
    "title": "Start a new app",
    "prompt": "Set up a new Rails app using the default React on Rails Pro path (no token required for development, test, CI/CD, or staging; production requires a paid license) with TypeScript and server-side rendering. Follow the official guide at https://reactonrails.com/docs/getting-started/create-react-on-rails-app exactly; don't improvise commands or versions. Use --standard only when you intentionally want an open-source-only scaffold.",
    "href": "/docs/getting-started/create-react-on-rails-app",
    "category": "get-started"
  },
  {
    "id": "install-existing",
    "title": "Add to an existing Rails app",
    "prompt": "Add React on Rails to my existing Rails app with TypeScript, keeping my current routes and conventions. Follow https://reactonrails.com/docs/getting-started/existing-rails-app and don't change any gem or package versions it doesn't tell you to.",
    "href": "/docs/getting-started/existing-rails-app",
    "category": "get-started"
  },
  {
    "id": "turn-on-rsc",
    "title": "Turn on React Server Components",
    "prompt": "Turn on React Server Components in my React on Rails app (no license required). Follow https://reactonrails.com/docs/pro/react-server-components exactly, including the renderer and packer setup it specifies.",
    "href": "/docs/pro/react-server-components",
    "category": "server-rendering"
  },
  {
    "id": "streaming-ssr",
    "title": "Add streaming SSR",
    "prompt": "Add streaming server-side rendering to my React on Rails app. Follow https://reactonrails.com/docs/pro/streaming-ssr exactly and don't change versions it doesn't ask you to.",
    "href": "/docs/pro/streaming-ssr",
    "category": "server-rendering"
  },
  {
    "id": "async-rendering",
    "title": "Use async/Suspense rendering",
    "prompt": "Set up async (Suspense) rendering for a React on Rails component. Follow https://reactonrails.com/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options-- exactly.",
    "href": "/docs/api-reference/ruby-api-pro#async_react_componentcomponent_name-options--",
    "category": "server-rendering"
  },
  {
    "id": "migrate-react-rails",
    "title": "Migrate from react-rails",
    "prompt": "Migrate my app from react-rails to React on Rails, keeping my existing components working. Follow https://reactonrails.com/docs/migrating/migrating-from-react-rails and don't skip any step it lists.",
    "href": "/docs/migrating/migrating-from-react-rails",
    "category": "migrate"
  },
  {
    "id": "code-splitting",
    "title": "Add code splitting",
    "prompt": "Add code splitting / lazy loading to my React on Rails components. Follow https://reactonrails.com/docs/building-features/code-splitting exactly.",
    "href": "/docs/building-features/code-splitting",
    "category": "features"
  },
  {
    "id": "oss-vs-pro",
    "title": "Evaluate OSS vs Pro",
    "prompt": "Review my React on Rails setup and tell me whether OSS or Pro fits my workload, citing the tradeoffs. Base your answer on https://reactonrails.com/docs/getting-started/oss-vs-pro.",
    "href": "/docs/getting-started/oss-vs-pro",
    "category": "production"
  },
  {
    "id": "node-renderer",
    "title": "Set up the Node renderer",
    "prompt": "Set up the React on Rails Pro Node renderer for server rendering. Follow https://reactonrails.com/docs/pro/node-renderer exactly, including the configuration it specifies.",
    "href": "/docs/pro/node-renderer",
    "category": "production"
  },
  {
    "id": "fragment-caching",
    "title": "Add fragment caching",
    "prompt": "Add fragment caching to my server-rendered React on Rails components. Follow https://reactonrails.com/docs/pro/fragment-caching exactly.",
    "href": "/docs/pro/fragment-caching",
    "category": "production"
  },
  {
    "id": "upgrade-to-pro",
    "title": "Get a production license / upgrade to Pro",
    "prompt": "Walk me through upgrading my React on Rails app to Pro and getting a production license. Follow https://reactonrails.com/docs/pro/upgrading-to-pro.",
    "href": "/docs/pro/upgrading-to-pro",
    "category": "production"
  }
];

const homePromptIds = ["turn-on-rsc","create-app","install-existing"] as const;

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

export const promptGroups: PromptGroup[] = [
  {
    "category": "get-started",
    "eyebrow": "Get started",
    "heading": "Spin up React on Rails."
  },
  {
    "category": "server-rendering",
    "eyebrow": "Server rendering",
    "heading": "Render on the server: RSC, SSR, streaming."
  },
  {
    "category": "migrate",
    "eyebrow": "Migrate",
    "heading": "Move an existing setup to React on Rails."
  },
  {
    "category": "features",
    "eyebrow": "Build features",
    "heading": "Add common capabilities."
  },
  {
    "category": "production",
    "eyebrow": "Optimize & go to production",
    "heading": "Tune performance and ship with Pro."
  }
];
