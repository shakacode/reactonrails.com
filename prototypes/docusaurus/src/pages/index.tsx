import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const personaPaths = [
  {
    eyebrow: 'New app',
    title: 'Starting a new Rails + React app',
    description:
      'Use the CLI-backed happy path, get to a working app quickly, and customize from a clean baseline.',
    href: '/docs/getting-started/create-react-on-rails-app',
    cta: 'Create a new app',
  },
  {
    eyebrow: 'Existing app',
    title: 'Adding React to an existing Rails app',
    description:
      'Keep the Rails app you already have, install React on Rails, and render components without rebuilding the stack.',
    href: '/docs/getting-started/installation-into-an-existing-rails-app',
    cta: 'Install into an existing app',
  },
  {
    eyebrow: 'Upgrade',
    title: 'Already on OSS and need more performance',
    description:
      'See what Pro adds, how the upgrade works, and where higher-throughput SSR or RSC support fits.',
    href: '/docs/getting-started/oss-vs-pro',
    cta: 'Compare OSS and Pro',
  },
  {
    eyebrow: 'Evaluate',
    title: 'Evaluating Rails + React options',
    description:
      'Compare React on Rails with Hotwire/Turbo, Inertia Rails, and react-rails before you dive into migration details.',
    href: '/docs/getting-started/comparison-with-alternatives',
    cta: 'Compare the options',
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
    title: 'Compare Rails + React approaches',
    description:
      'Use the new evaluator guide first, then branch into concrete migration docs if React on Rails is the right fit.',
    href: '/docs/getting-started/comparison-with-alternatives',
  },
  {
    title: 'Migrate from react-rails',
    description:
      'Move from `react-rails` with guidance for both Webpacker-era apps and newer Vite-style setups.',
    href: '/docs/migrating/migrating-from-react-rails',
  },
  {
    title: 'Upgrade an existing react_on_rails app',
    description:
      'Start with the preflight that surfaced real `pg`, `nio4r`, and `mysql2` blockers before applying the current upgrade steps.',
    href: '/docs/upgrading/upgrading-react-on-rails',
  },
  {
    title: 'Browse sample apps',
    description:
      'Open the public apps used to validate the migration and upgrade docs with concrete examples.',
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
          <p className={styles.kicker}>React on Rails documentation</p>
          <h1 className={styles.title}>Build Rails apps with React without dropping Rails conventions.</h1>
          <p className={styles.subtitle}>
            Choose the path that matches your app first. Then add SSR, streaming, RSC, migration,
            or Pro support only when you actually need it.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs">
              Get started
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/getting-started/create-react-on-rails-app">
              Create an app
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/getting-started/comparison-with-alternatives">
              Compare approaches
            </Link>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.heroWindowBar}>
            <span className={styles.windowTitle}>quickstart.sh</span>
            <div className={styles.windowDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <p className={styles.panelLabel}>Recommended first run</p>
          <pre className={styles.heroCode}>
            <code>{`npx create-react-on-rails-app@latest my-app
cd my-app
bin/rails db:prepare
bin/dev`}</code>
          </pre>
          <div className={styles.heroPills}>
            <span>New app</span>
            <span>Rails views</span>
            <span>SSR ready</span>
            <span>TypeScript</span>
          </div>
          <p className={styles.panelNote}>
            Existing-app install, migration, and Pro upgrade paths stay on equal footing in the
            docs. This is just the cleanest first run.
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
          <h2>Start from your situation, not from our internal docs structure.</h2>
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
          <h2>Lead with the default. Put alternate paths beside it, not ahead of it.</h2>
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
          <h2>Evaluation and migration work better when the docs point to concrete routes.</h2>
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
          <h2>Teams adopt Pro when they need more throughput or guided help, not a separate toolchain.</h2>
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
