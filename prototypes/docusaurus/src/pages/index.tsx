import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const personaPaths = [
  {
    eyebrow: 'Persona A',
    title: 'Starting a new Rails + React app',
    description:
      'Use the CLI-backed happy path, get to a working app quickly, and customize from a clean baseline.',
    href: '/docs/getting-started/create-react-on-rails-app',
    cta: 'Create a new app',
  },
  {
    eyebrow: 'Persona B',
    title: 'Adding React to an existing Rails app',
    description:
      'Keep the Rails app you already have, install React on Rails, and render components without rebuilding the stack.',
    href: '/docs/getting-started/installation-into-an-existing-rails-app',
    cta: 'Install into an existing app',
  },
  {
    eyebrow: 'Persona C',
    title: 'Already on OSS and need more performance',
    description:
      'See what Pro adds, how the upgrade works, and where higher-throughput SSR or RSC support fits.',
    href: '/docs/getting-started/oss-vs-pro',
    cta: 'Compare OSS and Pro',
  },
  {
    eyebrow: 'Persona D',
    title: 'Evaluating Rails + React options',
    description:
      'Review example apps, migration references, and concrete paths from react-rails or vite_rails.',
    href: '/examples',
    cta: 'Evaluate the ecosystem fit',
  },
];

const recommendedFlows = [
  {
    title: 'Recommended for new projects',
    summary: 'Start with one working path before you branch into deeper configuration.',
    command: 'npx create-react-on-rails-app@latest my-app',
    href: '/docs/getting-started/create-react-on-rails-app',
    cta: 'Follow the new-app guide',
  },
  {
    title: 'For mature Rails apps',
    summary: 'Install React on Rails into an existing codebase, keep your routes, and add components incrementally.',
    command: 'bundle exec rails generate react_on_rails:install --typescript',
    href: '/docs/getting-started/installation-into-an-existing-rails-app',
    cta: 'Use the install guide',
  },
  {
    title: 'When OSS is no longer enough',
    summary: 'Pro is an upgrade tier, not a separate product. Add it when you need more SSR throughput or guided support.',
    command: 'bundle add react_on_rails_pro',
    href: '/docs/pro/upgrading-to-pro',
    cta: 'Review the upgrade path',
  },
];

const migrationGuides = [
  {
    title: 'Migrate from react-rails',
    description:
      'Swap from `react-rails` to React on Rails with a migration checklist grounded in a real sample app.',
    href: '/docs/migrating/migrating-from-react-rails',
  },
  {
    title: 'Migrate from vite_rails',
    description:
      'Keep Vite-era lessons that still matter, then move to the supported React on Rails integration model.',
    href: '/docs/migrating/migrating-from-vite-rails',
  },
  {
    title: 'Browse sample apps',
    description:
      'Open repositories that show canonical SSR, migration, and evaluation workflows without marketing detours.',
    href: '/examples',
  },
];

const testimonials = [
  {
    quote:
      "React on Rails lets us run React at scale inside Rails without the complexity of a separate frontend deployment. ShakaCode's implementation optimized the framework for our specific workload, delivering 97% Good LCP scores and 80% faster hydration across our platform.",
    author: 'Justis Blasco',
    role: 'Popmenu',
  },
];

function HeroSection() {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={clsx('container', styles.heroLayout)}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Official documentation for one product with two tiers</p>
          <h1 className={styles.title}>React on Rails keeps Rails conventions and adds modern React.</h1>
          <p className={styles.subtitle}>
            Start with one recommended path, then branch into SSR, streaming, RSC, migration, or
            Pro only when you need them.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs">
              Start with the docs
            </Link>
            <Link className="button button--secondary button--lg" to="/examples">
              Review examples
            </Link>
            <Link className="button button--secondary button--lg" to="/pro">
              Understand Pro
            </Link>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.panelLabel}>Recommended first run</p>
          <ol className={styles.heroSteps}>
            <li>
              <code>npx create-react-on-rails-app@latest my-app</code>
            </li>
            <li>
              <code>bin/rails db:prepare</code>
            </li>
            <li>
              <code>bin/dev</code>
            </li>
          </ol>
          <p className={styles.panelNote}>
            If you are not starting fresh, the docs route you into existing-app install, migration,
            or Pro upgrade paths instead.
          </p>
        </div>
      </div>
    </header>
  );
}

function PersonaSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Choose your path</p>
          <h2>Docs should start from your situation, not from our internal file layout.</h2>
        </div>
        <div className={styles.personaGrid}>
          {personaPaths.map((persona) => (
            <article className={styles.personaCard} key={persona.title}>
              <p className={styles.cardEyebrow}>{persona.eyebrow}</p>
              <h3>{persona.title}</h3>
              <p>{persona.description}</p>
              <Link className={styles.cardLink} to={persona.href}>
                {persona.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowSection() {
  return (
    <section className={styles.sectionSoft}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Recommended flow</p>
          <h2>Keep the first-run path obvious. Put alternatives behind it, not in front of it.</h2>
        </div>
        <div className={styles.flowGrid}>
          {recommendedFlows.map((flow) => (
            <article className={styles.flowCard} key={flow.title}>
              <p className={styles.cardEyebrow}>{flow.title}</p>
              <p className={styles.flowSummary}>{flow.summary}</p>
              <code className={styles.inlineCode}>{flow.command}</code>
              <Link className={styles.cardLink} to={flow.href}>
                {flow.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MigrationSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Migration and evaluation</p>
          <h2>Modern docs need concrete migration routes, not generic reassurance.</h2>
        </div>
        <div className={styles.migrationGrid}>
          {migrationGuides.map((guide) => (
            <article className={styles.migrationCard} key={guide.title}>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <Link className={styles.cardLink} to={guide.href}>
                Open guide
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className={styles.sectionInk}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Production feedback</p>
          <h2>React on Rails Pro is an upgrade tier for teams that need more, not a separate ecosystem.</h2>
        </div>
        <div className={styles.quoteGrid}>
          {testimonials.map((entry) => (
            <blockquote className={styles.quoteCard} key={entry.author}>
              <p>{entry.quote}</p>
              <footer>
                <strong>{entry.author}</strong>
                <span>{entry.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="React on Rails"
      description="Official React on Rails documentation, examples, and React on Rails Pro details.">
      <HeroSection />
      <main>
        <PersonaSection />
        <FlowSection />
        <MigrationSection />
        <TestimonialsSection />
      </main>
    </Layout>
  );
}
