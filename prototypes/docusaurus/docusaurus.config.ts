import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {GlobExcludeDefault} from '@docusaurus/utils';

const config: Config = {
  title: 'React on Rails',
  tagline: 'Integrate React with Rails, including SSR, RSC, and production-grade docs.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://reactonrails.com',
  baseUrl: '/',

  organizationName: 'shakacode',
  projectName: 'reactonrails.com',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchBarShortcutHint: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          exclude: [...GlobExcludeDefault, '**/planning/**'],
          editUrl: ({docPath}) => {
            const root = 'https://github.com/shakacode/react_on_rails/tree/main/docs/';
            if (docPath === 'README.md') {
              return `${root}README.md`;
            }
            if (docPath.startsWith('pro/')) {
              return `${root}${docPath}`;
            }
            return `${root}oss/${docPath}`;
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/react-on-rails-social-card.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'consultation_cta',
      content:
        'Want expert advice on your React on Rails setup? <a href="https://meetings.hubspot.com/justingordon/30-minute-consultation">Book a complimentary 30-minute assessment</a> with the ShakaCode team.',
      isCloseable: true,
    },
    navbar: {
      title: 'React on Rails',
      logo: {
        alt: 'React on Rails Logo',
        src: 'img/logo-mark.png',
        width: 64,
        height: 64,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/examples', label: 'Examples', position: 'left'},
        {to: '/pro', label: 'React on Rails Pro', position: 'left'},
        {
          href: 'https://www.shakacode.com/contact/',
          label: 'Get Expert Help',
          position: 'right',
          className: 'navbar-cta',
        },
        {
          href: 'https://github.com/shakacode/react_on_rails',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://github.com/sponsors/shakacode',
          label: 'Sponsor',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Documentation Guide',
              to: '/docs',
            },
            {label: 'Create a New App', to: '/docs/getting-started/create-react-on-rails-app'},
            {
              label: 'Install into Existing Rails App',
              to: '/docs/getting-started/installation-into-an-existing-rails-app',
            },
            {label: 'Quick Start', to: '/docs/getting-started/quick-start'},
            {label: 'React on Rails Pro', to: '/docs/pro'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Examples',
              to: '/examples',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/shakacode/react_on_rails/discussions',
            },
            {
              label: 'ShakaCode',
              href: 'https://www.shakacode.com',
            },
            {
              label: 'Book a Complimentary Assessment',
              href: 'https://meetings.hubspot.com/justingordon/30-minute-consultation',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'React on Rails Pro',
              to: '/pro',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/shakacode/react_on_rails',
            },
            {
              label: 'Sponsor',
              href: 'https://github.com/sponsors/shakacode',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ShakaCode. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['ruby', 'markup-templating', 'erb', 'diff', 'haml', 'bash', 'regex', 'ignore'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
