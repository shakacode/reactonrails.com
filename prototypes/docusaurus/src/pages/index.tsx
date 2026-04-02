import {useEffect, useRef, useState, type KeyboardEvent, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './index.module.css';

const personaPaths = [
  {
    title: 'Starting a new Rails + React app',
    description:
      'Use the CLI to scaffold a working app, then customize from a clean baseline.',
    href: docsRoutes.createApp,
    cta: 'Create a new app',
  },
  {
    title: 'Adding React to an existing Rails app',
    description:
      'Install React on Rails into your existing app and render components without rebuilding the stack.',
    href: docsRoutes.installExistingApp,
    cta: 'Install into an existing app',
  },
  {
    title: 'Already on OSS and need more performance',
    description:
      'See the canonical Pro overview first, then follow the upgrade guidance for your app.',
    href: docsRoutes.proOverview,
    cta: 'Open Pro overview',
  },
  {
    title: 'Evaluating Rails + React options',
    description:
      'Browse example apps and migration paths from react-rails or vite_rails.',
    href: '/examples',
    cta: 'See examples',
  },
];

const recommendedFlows = [
  {
    title: 'Recommended for new projects',
    summary: 'One command to a working app. Customize after.',
    command: 'npx create-react-on-rails-app@latest my-app',
    href: docsRoutes.createApp,
    cta: 'Follow the new-app guide',
  },
  {
    title: 'For mature Rails apps',
    summary: 'Add React on Rails to your existing codebase. Keep your routes, add components incrementally.',
    command: 'bundle exec rails generate react_on_rails:install --typescript',
    href: docsRoutes.installExistingApp,
    cta: 'Use the install guide',
  },
  {
    title: 'When OSS is no longer enough',
    summary: 'Pro is an upgrade tier, not a separate product. Add it when you need more SSR throughput or guided support.',
    command: 'bundle add react_on_rails_pro',
    href: docsRoutes.proUpgrade,
    cta: 'Review the upgrade path',
  },
];

const migrationGuides = [
  {
    title: 'Migrate from react-rails',
    description:
      'Step-by-step checklist for swapping `react-rails` to React on Rails, with a sample app.',
    href: docsRoutes.migrateFromReactRails,
  },
  {
    title: 'Browse sample apps',
    description:
      'Working repositories showing SSR, migration, and integration patterns.',
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

type Language = 'ts' | 'js';
type Rendering = 'basic' | 'pro-ssr' | 'rsc';

function buildFirstRunCommands(lang: Language, rendering: Rendering): string[] {
  const flags: string[] = [];
  if (lang === 'js') flags.push('--js');
  if (rendering === 'pro-ssr') flags.push('--ssr');
  if (rendering === 'rsc') flags.push('--rsc');

  const flagStr = flags.length > 0 ? ' ' + flags.join(' ') : '';
  return [
    `npx create-react-on-rails-app@latest my-app${flagStr}`,
    'cd my-app',
    'bin/rails db:prepare',
    'bin/dev',
  ];
}

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
  const [lang, setLang] = useState<Language>('ts');
  const [rendering, setRendering] = useState<Rendering>('basic');
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commands = buildFirstRunCommands(lang, rendering);
  const commandText = commands.join('\n');
  const heroLogoSrc = useBaseUrl('/img/logo-mark.png');

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

  const handleRadioKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const group = e.currentTarget.parentElement;
    if (!group) return;
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    const idx = buttons.indexOf(e.currentTarget);
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (idx + 1) % buttons.length
        : (idx - 1 + buttons.length) % buttons.length;
    buttons[next].click();
    buttons[next].focus();
  };

  const copyButtonLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Retry copy' : 'Copy commands';

  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={clsx('container', styles.heroLayout)}>
        <div className={styles.heroContent}>
          <div className={styles.heroIdentity}>
            <div className={styles.heroLogoFrame}>
              <img
                className={styles.heroLogo}
                src={heroLogoSrc}
                alt="React on Rails logo"
                width="64"
                height="64"
              />
            </div>
            <div className={styles.heroIdentityText}>
              <span className={styles.heroName}>React on Rails</span>
              <p className={clsx(styles.kicker, styles.heroKicker)}>
                One product, two tiers: OSS and Pro
              </p>
            </div>
          </div>
          <h1 className={styles.title}>React on Rails keeps Rails conventions and adds modern React.</h1>
          <p className={styles.subtitle}>
            One recommended path to start. Branch into SSR, streaming, RSC, or Pro when you need
            them.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to={docsRoutes.docsGuide}>
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
          <div className={styles.toggleRow}>
            <div className={styles.toggleGroup} role="radiogroup" aria-label="Language">
              <button
                type="button"
                role="radio"
                aria-checked={lang === 'ts'}
                tabIndex={lang === 'ts' ? 0 : -1}
                className={clsx(styles.toggleButton, lang === 'ts' && styles.toggleActive)}
                onKeyDown={handleRadioKeyDown}
                onClick={() => setLang('ts')}>
                TypeScript
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={lang === 'js'}
                tabIndex={lang === 'js' ? 0 : -1}
                className={clsx(styles.toggleButton, lang === 'js' && styles.toggleActive)}
                onKeyDown={handleRadioKeyDown}
                onClick={() => setLang('js')}>
                JavaScript
              </button>
            </div>
            <div className={styles.toggleGroup} role="radiogroup" aria-label="Rendering strategy">
              <button
                type="button"
                role="radio"
                aria-checked={rendering === 'basic'}
                tabIndex={rendering === 'basic' ? 0 : -1}
                className={clsx(styles.toggleButton, rendering === 'basic' && styles.toggleActive)}
                onKeyDown={handleRadioKeyDown}
                onClick={() => setRendering('basic')}>
                Basic
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={rendering === 'pro-ssr'}
                tabIndex={rendering === 'pro-ssr' ? 0 : -1}
                className={clsx(styles.toggleButton, rendering === 'pro-ssr' && styles.toggleActive)}
                onKeyDown={handleRadioKeyDown}
                onClick={() => setRendering('pro-ssr')}>
                Pro SSR
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={rendering === 'rsc'}
                tabIndex={rendering === 'rsc' ? 0 : -1}
                className={clsx(styles.toggleButton, rendering === 'rsc' && styles.toggleActive)}
                onKeyDown={handleRadioKeyDown}
                onClick={() => setRendering('rsc')}>
                RSC
              </button>
            </div>
          </div>
          <ol className={styles.heroSteps}>
            {commands.map((command) => (
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
            Not starting fresh? See the install, migration, or Pro upgrade guides below.
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
              <h3 className={styles.cardEyebrow}>{flow.title}</h3>
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
          <p className={styles.sectionEyebrow}>Migration</p>
          <h2>Move from another setup</h2>
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
            <h2>Talk to the team behind React on Rails</h2>
            <p>
              ShakaCode maintains React on Rails and helps teams ship with SSR, RSC, and Rails
              integration. Book a free 30-minute call for architecture, performance, or migration
              advice.
            </p>
          </div>
          <div className={styles.consultationActions}>
            <Link
              className="button button--primary button--lg"
              href="https://meetings.hubspot.com/justingordon/30-minute-consultation">
              Book a free call
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
          <p className={styles.sectionEyebrow}>In production</p>
          <h2>Teams shipping with React on Rails</h2>
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
    <Layout description="Official React on Rails documentation, examples, and React on Rails Pro details.">
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
