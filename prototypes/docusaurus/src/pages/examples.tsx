import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './examples.module.css';

const decisionPaths = [
  {
    eyebrow: 'Starter path',
    title: 'Start a new Rails + React app',
    description:
      'Use the create-app and quick-start docs first, then compare the maintained starter repos for SSR + HMR or React on Rails Pro + RSC.',
    href: docsRoutes.docsGuide,
    cta: 'Open starter docs',
  },
  {
    eyebrow: 'Migration path',
    title: 'Move from react-rails',
    description:
      'Use the migration guide together with the maintained migration reference repos instead of reconstructing the process from older blog posts.',
    href: docsRoutes.migrateFromReactRails,
    cta: 'Use the migration guide',
  },
  {
    eyebrow: 'Pro path',
    title: 'Evaluate React on Rails Pro + RSC',
    description:
      'Start with the OSS vs Pro guide, then use the public RSC demos to judge where the added complexity pays for itself.',
    href: docsRoutes.ossVsPro,
    cta: 'Compare OSS and Pro',
  },
];

const catalogSections = [
  {
    eyebrow: 'Starters',
    title: 'Current starting points',
    description:
      'These are the best public repos to start from when you want a maintained reference instead of a historical artifact.',
    items: [
      {
        title: 'SSR + HMR tutorial demo',
        repo: 'react-on-rails-demo-ssr-hmr',
        description:
          'Maintained Rails + React + SSR + HMR tutorial repo. This is the reference behind the tutorial and Webpack customization guidance.',
        href: 'https://github.com/shakacode/react-on-rails-demo-ssr-hmr',
        tags: ['OSS', 'SSR', 'HMR'],
      },
      {
        title: 'React on Rails Pro + RSC starter',
        repo: 'react-on-rails-rsc-demo',
        description:
          'Minimal public sample for React Server Components with React on Rails Pro. Use this when you want the smallest current RSC starting point.',
        href: 'https://github.com/shakacode/react-on-rails-rsc-demo',
        tags: ['Pro', 'RSC', 'Starter'],
      },
    ],
  },
  {
    eyebrow: 'Migrations',
    title: 'Adoption and migration references',
    description:
      'Use these when your question is not “how do I start?” but “how do I move an existing app?”',
    items: [
      {
        title: 'react-rails migration example',
        repo: 'react-on-rails-example-migration',
        description:
          'Focused migration reference showing the shape of moving from react-rails into React on Rails.',
        href: 'https://github.com/shakacode/react-on-rails-example-migration',
        tags: ['OSS', 'Migration'],
      },
      {
        title: 'Open Flights migration example',
        repo: 'react-on-rails-example-open-flights',
        description:
          'Larger migration reference that shows React on Rails replacing react-rails in a more realistic app.',
        href: 'https://github.com/shakacode/react-on-rails-example-open-flights',
        tags: ['OSS', 'Migration', 'App'],
      },
    ],
  },
  {
    eyebrow: 'React on Rails Pro',
    title: 'RSC and performance demos',
    description:
      'These public demos use React on Rails Pro and React Server Components. Reach for them when the conversation is about measured user-visible wins.',
    items: [
      {
        title: 'Hacker News RSC demo',
        repo: 'react-on-rails-demo-hacker-news-rsc',
        description:
          'Compact public demo of React on Rails Pro + React Server Components on a familiar read-heavy UI.',
        href: 'https://github.com/shakacode/react-on-rails-demo-hacker-news-rsc',
        tags: ['Pro', 'RSC', 'Demo'],
      },
      {
        title: 'Marketplace RSC performance demo',
        repo: 'react-on-rails-demo-marketplace-rsc',
        description:
          'Public performance-oriented RSC demo showing the shape of the user-visible improvement on a marketplace-style surface.',
        href: 'https://github.com/shakacode/react-on-rails-demo-marketplace-rsc',
        tags: ['Pro', 'RSC', 'Performance'],
      },
      {
        title: 'Gumroad-style comparison demo',
        repo: 'react-on-rails-demo-gumroad-rsc',
        description:
          'Benchmark-oriented comparison between an Inertia-style surface and a React on Rails Pro + RSC surface on the same product domain. ShakaCode-built demo, not an official Gumroad integration.',
        href: 'https://github.com/shakacode/react-on-rails-demo-gumroad-rsc',
        tags: ['Pro', 'RSC', 'Benchmark'],
      },
    ],
  },
  {
    eyebrow: 'Legacy',
    title: 'Historical full-app reference',
    description:
      'This repo is still useful when you want to see an older production-style app, but it is no longer the recommended starting point for new work.',
    items: [
      {
        title: 'react-webpack-rails-tutorial',
        repo: 'react-webpack-rails-tutorial',
        description:
          'Older full-app reference with a live demo at reactrails.com. Keep this for historical context rather than as the primary starter.',
        href: 'https://github.com/shakacode/react-webpack-rails-tutorial',
        tags: ['Legacy', 'Full App'],
      },
    ],
  },
];

export default function ExamplesPage(): ReactNode {
  return (
    <Layout
      title="Examples and Demos"
      description="React on Rails demos, migration examples, and React on Rails Pro + RSC benchmark apps."
    >
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>Examples, demos, and migration references</p>
            <h1>Use the maintained public repos when you evaluate React on Rails.</h1>
            <p className={styles.lead}>
              This catalog exists to make adoption easier: choose the path that matches your app,
              use the current example repos, and ignore historical artifacts unless you are doing
              archaeology.
            </p>
          </div>
        </section>

        <section className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Start with the right path</p>
            <h2>Choose the guide that matches your evaluation or migration goal.</h2>
          </div>
          <div className={styles.decisionGrid}>
            {decisionPaths.map((path) => (
              <article className={styles.card} key={path.title}>
                <p className={styles.cardEyebrow}>{path.eyebrow}</p>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <Link className={styles.cardLink} to={path.href}>
                  {path.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {catalogSections.map((section) => (
          <section className="container" key={section.title}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p className={styles.sectionLead}>{section.description}</p>
            </div>
            <div className={styles.grid}>
              {section.items.map((item) => (
                <article className={styles.card} key={item.repo}>
                  <h3>{item.title}</h3>
                  <p className={styles.repoMeta}>{item.repo}</p>
                  <p>{item.description}</p>
                  <div className={styles.tagRow}>
                    {item.tags.map((tag) => (
                      <span className={styles.tag} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link className={styles.cardLink} href={item.href}>
                    Open repository
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Source of truth</p>
            <h2>Use the docs for taxonomy and this page for curation.</h2>
            <p className={styles.sectionLead}>
              The canonical docs page for repo taxonomy lives in{' '}
              <Link to={docsRoutes.docsGuide}>the docs guide</Link>
              . This page is the marketing-forward catalog of the public repos we want people to
              find first.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
