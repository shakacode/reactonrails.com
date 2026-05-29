export type DemoCategory = 'flagship' | 'starter' | 'legacy';

export type Demo = {
  /** Slug; also used for the screenshot filename under static/img/demos/. */
  id: string;
  name: string;
  tagline: string;
  /** GitHub source repository. */
  repoUrl: string;
  /** Live deployment. Omit when the deployment is not live yet ("Demo coming soon"). */
  demoUrl?: string;
  /** Screenshot/thumbnail path. Omit to render the branded placeholder. */
  image?: string;
  category: DemoCategory;
  /** When true, the demo is featured in the homepage "Live demos" section. */
  featured?: boolean;
};

export const demos: Demo[] = [
  {
    id: 'hacker-news',
    name: 'Hacker News',
    tagline:
      'A Hacker News reader built on React on Rails Pro with React 19 and React Server Components.',
    repoUrl: 'https://github.com/shakacode/react-on-rails-demo-hacker-news-rsc',
    category: 'flagship',
    featured: true,
  },
  {
    id: 'gumroad',
    name: 'Gumroad',
    tagline:
      'A Gumroad-style creator dashboard comparing Inertia and React on Rails Pro with React 19 and RSC.',
    repoUrl: 'https://github.com/shakacode/react-on-rails-demo-gumroad-rsc',
    category: 'flagship',
    featured: true,
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    tagline:
      'A marketplace performance demo for React on Rails Pro, React 19, and React Server Components.',
    repoUrl: 'https://github.com/shakacode/react-on-rails-demo-marketplace-rsc',
    demoUrl: 'https://rsc.reactonrails.com',
    category: 'flagship',
    featured: true,
  },
  {
    id: 'tanstack-starter',
    name: 'TanStack Starter',
    tagline: 'A minimal React on Rails + TanStack starter template to build from.',
    repoUrl: 'https://github.com/shakacode/react-on-rails-starter-tanstack',
    demoUrl: 'https://start.reactonrails.com',
    category: 'starter',
  },
  {
    id: 'legacy-tutorial',
    name: 'Legacy tutorial app',
    tagline:
      'The original full-app React on Rails tutorial demo, running in production for years.',
    repoUrl: 'https://github.com/shakacode/react-webpack-rails-tutorial',
    demoUrl: 'https://www.reactrails.com',
    category: 'legacy',
  },
];

export const featuredDemos = demos.filter((demo) => demo.featured);
