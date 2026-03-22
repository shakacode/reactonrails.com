import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const personaPaths = [
  {
    title: 'Starting a new Rails + React app',
    description:
      'Use the CLI-backed happy path, get to a working app quickly, and customize from a clean baseline.',
    href: '/docs/getting-started/create-react-on-rails-app',
    cta: 'Create a new app',
  },
  {
    title: 'Adding React to an existing Rails app',
    description:
      'Keep the Rails app you already have, install React on Rails, and render components without rebuilding the stack.',
    href: '/docs/getting-started/installation-into-an-existing-rails-app',
    cta: 'Install into an existing app',
  },
  {
    title: 'Already on OSS and need more performance',
    description:
      'See what Pro adds, how the upgrade works, and where higher-throughput SSR or RSC support fits.',
    href: '/docs/getting-started/oss-vs-pro',
    cta: 'Compare OSS and Pro',
  },
  {
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

const firstRunCommands = [
  'npx create-react-on-rails-app@latest my-app',
  'cd my-app',
  'bin/rails db:prepare',
  'bin/dev',
];

async function copyToClipboard(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to legacy copy path when Clipboard API exists but fails at runtime.
    }
  }

  if (typeof document !== 'undefined') {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    try {
      textArea.select();
      const copied = document.execCommand('copy');
      if (!copied) throw new Error('Fallback copy failed');
      return;
    } finally {
      document.body.removeChild(textArea);
    }
  }

  throw new Error('Clipboard unavailable');
}

function HeroSection() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandText = firstRunCommands.join('\n');

  useEffect(
    () => () => {
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
      }
    },
    []
  );

  const handleCopyFirstRun = async () => {
    try {
      await copyToClipboard(commandText);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }

    if (copyResetTimerRef.current) {
      clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = setTimeout(() => {
      setCopyState('idle');
      copyResetTimerRef.current = null;
    }, 1800);
  };

  const copyButtonLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Retry copy' : 'Copy commands';

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
            {firstRunCommands.map((command) => (
              <li key={command}>
                <code>{command}</code>
              </li>
            ))}
          </ol>
          <div className={styles.panelActions}>
            <button
              type="button"
              className={clsx('button button--secondary button--sm', styles.copyButton)}
              onClick={handleCopyFirstRun}>
              {copyButtonLabel}
            </button>
          </div>
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
          <p className={styles.sectionEyebrow}>Choose your situation</p>
          <h2>Start where you are.</h2>
        </div>
        <div className={styles.personaGrid}>
          {personaPaths.map((persona) => (
            <article className={styles.personaCard} key={persona.title}>
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

function ConsultationSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.consultationBanner}>
          <div className={styles.consultationContent}>
            <p className={styles.sectionEyebrow}>Expert help</p>
            <h2>Get free advice from the team behind React on Rails</h2>
            <p>
              ShakaCode maintains React on Rails and has helped teams ship production apps with
              SSR, RSC, and Rails integration. Book a complimentary 30-minute assessment to get
              hands-on advice about your architecture, performance, or migration path.
            </p>
          </div>
          <div className={styles.consultationActions}>
            <Link
              className="button button--primary button--lg"
              href="https://meetings.hubspot.com/justingordon/30-minute-consultation">
              Book a complimentary assessment
            </Link>
            <Link
              className="button button--secondary button--lg"
              href="https://www.shakacode.com">
              Learn about ShakaCode
            </Link>
          </div>
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
        <ConsultationSection />
      </main>
    </Layout>
  );
}
