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

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          exclude: [...GlobExcludeDefault, '**/planning/**'],
          editUrl:
            'https://github.com/shakacode/react_on_rails/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'React on Rails',
      logo: {
        alt: 'React on Rails Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/examples', label: 'Examples', position: 'left'},
        {to: '/pro', label: 'Pro', position: 'left'},
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
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/introduction',
            },
            {label: 'Quick Start', to: '/docs/getting-started/quick-start'},
            {label: 'React on Rails Pro', to: '/docs/pro/react-on-rails-pro'},
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
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Pro',
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
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
