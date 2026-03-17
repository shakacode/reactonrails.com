import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const quickStartSteps = [
  {
    title: 'Install',
    command: 'bundle add react_on_rails',
    docsPath: '/docs/getting-started/quick-start',
  },
  {
    title: 'Create App',
    command: 'rails generate react_on_rails:install',
    docsPath: '/docs/getting-started/create-react-on-rails-app',
  },
  {
    title: 'Render',
    command: '<%= react_component(...) %>',
    docsPath: '/docs/getting-started/using-react-on-rails',
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
      <div className={clsx('container', styles.heroContent)}>
        <p className={styles.kicker}>React + Rails, production-first</p>
        <h1 className={styles.title}>React on Rails</h1>
        <p className={styles.subtitle}>
          Keep Rails conventions, add modern React features, and scale with SSR, streaming, and
          React Server Components.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start">
            Get Started
          </Link>
          <Link className="button button--secondary button--lg" to="/examples">
            Explore Examples
          </Link>
          <Link className="button button--secondary button--lg" to="/pro">
            Compare Pro
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickStartSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Quick Start</h2>
        <div className={styles.stepGrid}>
          {quickStartSteps.map((step) => (
            <article className={styles.stepCard} key={step.title}>
              <h3>{step.title}</h3>
              <code className={styles.inlineCode}>{step.command}</code>
              <p>
                <Link to={step.docsPath}>Open guide</Link>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className={styles.sectionAlt}>
      <div className="container">
        <h2>What Teams Report</h2>
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

function ArchitectureSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Docs Architecture</h2>
        <p>
          Canonical markdown stays in <code>react_on_rails/docs</code>. This site fetches that
          content at build time, so docs remain co-located with the code while the site can ship
          independently.
        </p>
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
        <QuickStartSection />
        <ArchitectureSection />
        <TestimonialsSection />
      </main>
    </Layout>
  );
}
