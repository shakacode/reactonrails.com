import {useEffect, useRef, useState, type KeyboardEvent, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';

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
      'Compare OSS and Pro first, then upgrade only when higher-throughput SSR, RSC, or support is worth it.',
    href: docsRoutes.ossVsPro,
    cta: 'Compare OSS and Pro',
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
    summary:
      'Pro is an upgrade tier, not a separate product. Compare first, then add it when the extra SSR throughput or guided support matters.',
    command: 'bundle add react_on_rails_pro',
    href: docsRoutes.proUpgrade,
    cta: 'Open the upgrade guide',
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

function RailsIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#CC0000" d="M.741 19.365h8.36s-1.598-7.291 3.693-10.243l.134-.066c1.286-.637 4.907-2.431 10.702 1.854.19-.159.37-.286.37-.286s-5.503-5.492-11.63-4.878c-3.079.275-6.867 3.079-9.09 6.783C1.058 16.233.741 19.365.741 19.365Zm8.804-.783a10.682 10.682 0 0 1-.127-1.333l1.143.412c.063.498.159.963.254 1.376l-1.27-.455Zm-7.799-4.317L.529 13.82c-.201.455-.423.984-.529 1.27l1.217.444c.137-.359.36-.878.529-1.269Zm7.831.296.857.677c.042-.413.116-.825.222-1.238l-.762-.603c-.137.391-.233.783-.317 1.164Zm2.042-2.646-.508-.762c.191-.243.413-.486.656-.709l.476.72a5.958 5.958 0 0 0-.624.751ZM4.19 8.878l.752.656c-.254.265-.498.551-.72.836l-.815-.698c.244-.265.508-.529.783-.794Zm9.799 1.027-.243-.73c.265-.117.571-.233.931-.339l.233.698a6.82 6.82 0 0 0-.921.371Zm3.122-.656.042-.667c.339.021.688.064 1.048.138l-.042.656a5.859 5.859 0 0 0-1.048-.127ZM8.942 6.392l-.476-.731c-.265.138-.54.286-.826.455l.487.741c.275-.169.54-.328.815-.465Zm9.217-.053.042-.709c-.095-.053-.36-.18-1.026-.371l-.043.699c.349.116.688.243 1.027.381ZM13.238 5.28h.106l-.212-.645c-.328 0-.666.021-1.016.063l.201.625a8.87 8.87 0 0 1 .921-.043Z" />
    </svg>
  );
}

function ReactIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 23 20.46" aria-hidden="true">
      <path fill="#61dafb" d="M18.91 6.633q-.367-.126-.74-.234.062-.252.115-.506c.56-2.72.194-4.912-1.058-5.634-1.2-.692-3.162.03-5.144 1.755q-.293.255-.572.525-.187-.18-.38-.352C9.053.344 6.97-.432 5.72.29 4.523.984 4.168 3.045 4.67 5.623q.077.383.17.762c-.293.084-.578.173-.85.268-2.435.85-3.99 2.18-3.99 3.56 0 1.425 1.67 2.855 4.206 3.72q.308.106.622.196-.102.407-.18.82c-.482 2.533-.106 4.545 1.09 5.235 1.234.712 3.306-.02 5.325-1.784q.24-.208.48-.442.302.293.62.568c1.956 1.682 3.886 2.36 5.08 1.67 1.235-.715 1.636-2.876 1.115-5.505q-.06-.3-.138-.614.218-.064.428-.133C21.285 13.07 23 11.657 23 10.213c0-1.386-1.605-2.725-4.09-3.58zM12.73 2.756c1.698-1.478 3.285-2.06 4.01-1.644.77.444 1.068 2.235.584 4.584q-.047.23-.103.457a23.538 23.538 0 0 0-3.076-.486A23.08 23.08 0 0 0 12.2 3.24q.258-.248.528-.484zM6.79 11.39q.313.604.653 1.19.347.6.722 1.183a20.922 20.922 0 0 1-2.12-.34c.204-.657.454-1.34.746-2.032zm0-2.31c-.286-.678-.53-1.345-.73-1.99.655-.147 1.355-.267 2.084-.358q-.366.57-.705 1.16-.34.586-.65 1.188zm.522 1.156q.454-.945.98-1.854.522-.91 1.114-1.775c.684-.052 1.385-.08 2.094-.08.712 0 1.414.028 2.098.08q.585.865 1.108 1.77.526.906.992 1.845-.46.948-.988 1.862-.523.908-1.104 1.78c-.682.05-1.387.074-2.106.074-.716 0-1.412-.022-2.082-.066q-.596-.87-1.124-1.783-.526-.91-.982-1.854zm8.25 2.34q.346-.603.666-1.22A20.867 20.867 0 0 1 17 13.38a20.852 20.852 0 0 1-2.145.365q.364-.578.706-1.17zm.656-3.495q-.318-.604-.66-1.196-.338-.582-.7-1.15c.733.093 1.436.216 2.097.367a20.96 20.96 0 0 1-.737 1.98zM11.51 3.945a21.013 21.013 0 0 1 1.354 1.634q-1.358-.065-2.718 0c.447-.59.905-1.138 1.365-1.634zM6.214 1.14c.77-.445 2.47.19 4.264 1.783.115.102.23.208.345.318a23.545 23.545 0 0 0-1.96 2.426 24.008 24.008 0 0 0-3.068.477q-.088-.352-.158-.71v.002c-.433-2.21-.146-3.876.577-4.294zM5.09 13.183q-.285-.082-.566-.177A8.324 8.324 0 0 1 1.84 11.58a2.03 2.03 0 0 1-.857-1.368c0-.837 1.248-1.905 3.33-2.63q.393-.138.792-.25a23.565 23.565 0 0 0 1.12 2.904 23.922 23.922 0 0 0-1.134 2.946zm5.326 4.48a8.322 8.322 0 0 1-2.575 1.61 2.03 2.03 0 0 1-1.612.062c-.725-.42-1.027-2.034-.616-4.2q.074-.385.168-.764a23.104 23.104 0 0 0 3.1.448 23.91 23.91 0 0 0 1.974 2.44q-.214.207-.438.403zm1.122-1.112c-.466-.502-.93-1.058-1.384-1.656q.66.026 1.346.026.703 0 1.388-.03a20.894 20.894 0 0 1-1.35 1.66zm5.967 1.367a2.03 2.03 0 0 1-.753 1.428c-.725.42-2.275-.126-3.947-1.564q-.287-.246-.578-.526a23.09 23.09 0 0 0 1.928-2.448 22.936 22.936 0 0 0 3.115-.48q.07.284.124.556a8.32 8.32 0 0 1 .11 3.035zm.834-4.907c-.127.042-.256.082-.388.12a23.06 23.06 0 0 0-1.164-2.913 23.05 23.05 0 0 0 1.12-2.87c.234.067.463.14.683.215 2.13.732 3.428 1.816 3.428 2.65 0 .89-1.403 2.044-3.68 2.798z" />
      <path fill="#61dafb" d="M11.5 8.159a2.054 2.054 0 1 1-2.054 2.052A2.054 2.054 0 0 1 11.5 8.16" />
    </svg>
  );
}

const trustedByCompanies = [
  {name: 'Academia.edu', logo: '/img/logos/academia_logo.svg', href: 'https://www.academia.edu', invertDark: true},
  {name: 'ACTIVE Network', logo: '/img/logos/active_network_logo.png', href: 'https://www.activenetwork.com'},
  {name: 'AirRobe', logo: '/img/logos/airrobe_logo.svg', href: 'https://www.airrobe.com', invertDark: true},
  {name: 'Airtasker', logo: '/img/logos/airtasker_logo.svg', href: 'https://www.airtasker.com'},
  {name: 'Attuned Education Partners', logo: '/img/logos/attuned_logo.png', href: 'https://attunedpartners.com', invertDark: true},
  {name: 'City Falcon', logo: '/img/logos/city_falcon_logo.svg', href: 'https://www.cityfalcon.com', invertDark: true},
  {name: 'ClientCircle', logo: '/img/logos/clientcircle_logo.svg', href: 'https://clientcircle.com'},
  {name: 'Curbside Provisions', logo: '/img/logos/curbside_logo.png', href: 'https://curbsideprovisions.com'},
  {name: 'Direct Dental', logo: '/img/logos/direct_dental_logo.png', href: 'https://directdental.com'},
  {name: 'Ejbla', logo: '/img/logos/ejbla_logo.png', href: 'https://ejbla.com', invertDark: true},
  {name: 'Estately', logo: '/img/logos/estately_logo.png', href: 'https://www.estately.com', invertDark: true},
  {name: 'Heal.me', logo: '/img/logos/healme_logo.png', href: 'https://heal.me'},
  {name: 'Jewlr', logo: '/img/logos/jewlr_logo.svg', href: 'https://www.jewlr.com', invertDark: true},
  {name: 'Popmenu', logo: '/img/logos/popmenu_logo.png', href: 'https://popmenu.com'},
  {name: 'Printivity', logo: '/img/logos/printivity_logo.png', href: 'https://www.printivity.com'},
  {name: 'Sample Focus', logo: '/img/logos/sample_focus_logo.png', href: 'https://samplefocus.com', darkenLight: true},
  {name: 'Simply Business', logo: '/img/logos/simply_business_logo.svg', href: 'https://www.simplybusiness.co.uk', invertDark: true},
  {name: 'The Information', logo: '/img/logos/the_information_logo.svg', darkLogo: '/img/logos/the_information_logo_dark.svg', href: 'https://www.theinformation.com'},
  {name: 'User Interviews', logo: '/img/logos/user_interviews_logo.svg', darkLogo: '/img/logos/user_interviews_logo_dark.svg', href: 'https://www.userinterviews.com'},
];

function TrustedBySection() {
  const {withBaseUrl} = useBaseUrlUtils();
  return (
    <section className={styles.trustedBy}>
      <div className="container">
        <p className={styles.trustedByLabel}>Trusted in production by</p>
        <div className={styles.logoBar}>
          {trustedByCompanies.map((company) => (
            <a
              key={company.name}
              href={company.href}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                styles.logoItem,
                company.invertDark && styles.invertDark,
                company.darkenLight && styles.darkenLight,
              )}
              title={company.name}>
              {company.darkLogo ? (
                <ThemedImage
                  sources={{
                    light: withBaseUrl(company.logo),
                    dark: withBaseUrl(company.darkLogo),
                  }}
                  alt={company.name}
                />
              ) : (
                <img
                  src={withBaseUrl(company.logo)}
                  alt={company.name}
                  loading="lazy"
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [lang, setLang] = useState<Language>('ts');
  const [rendering, setRendering] = useState<Rendering>('basic');
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commands = buildFirstRunCommands(lang, rendering);
  const commandText = commands.join('\n');
  const heroLogoSrc = useBaseUrl('/img/logo-mark-pro.png');

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
          <div className={styles.heroLogoFrame}>
            <img
              className={styles.heroLogo}
              src={heroLogoSrc}
              alt="React on Rails logo"
              width="456"
              height="406"
            />
          </div>
          <h1 className={styles.heroName}>React on Rails</h1>
          <p className={styles.tagline}>
            <RailsIcon className={styles.taglineIcon} />
            <span>Rails conventions with modern React</span>
            <ReactIcon className={styles.taglineIcon} />
          </p>
          <p className={styles.subtitle}>
            Simple, yet powerful with full support of React 19.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to={docsRoutes.docsGuide}>
              Start with the docs
            </Link>
            <Link className="button button--secondary button--lg" to="/examples">
              Review examples
            </Link>
            <Link className="button button--secondary button--lg" to={docsRoutes.ossVsPro}>
              Compare OSS and Pro
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
            Already on OSS? Start with the comparison guide, then use the upgrade guide if you
            need Pro.
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
          <h2>Get running in minutes.</h2>
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

function UpgradeSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>OSS to Pro</p>
          <h2>Upgrade when you're ready.</h2>
        </div>
        <div className={styles.upgradeGrid}>
          <article className={styles.migrationCard}>
            <h3>1. Compare OSS and Pro</h3>
            <p>
              Start here if you already run the OSS product and want to know whether the upgrade
              is justified.
            </p>
            <Link className={styles.cardLink} to={docsRoutes.ossVsPro}>
              Open the comparison guide
            </Link>
          </article>
          <article className={styles.migrationCard}>
            <h3>2. Upgrade to Pro</h3>
            <p>
              Once the comparison says Pro is worth it, follow the upgrade guide and add the Pro
              package.
            </p>
            <Link className={styles.cardLink} to={docsRoutes.proUpgrade}>
              Open the upgrade guide
            </Link>
          </article>
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
  const shakaLogoSrc = useBaseUrl('/img/shakacode-icon.png');

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.consultationBanner}>
          <div className={styles.consultationContent}>
            <div className={styles.consultationIdentity}>
              <img
                className={styles.shakaLogo}
                src={shakaLogoSrc}
                alt="ShakaCode logo"
                width="192"
                height="192"
              />
              <div>
                <p className={styles.sectionEyebrow}>Built by ShakaCode</p>
                <h2>Talk to the maintainers.</h2>
              </div>
            </div>
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
        <TrustedBySection />
        <PersonaSection />
        <FlowSection />
        <UpgradeSection />
        <MigrationSection />
        <TestimonialsSection />
        <ConsultationSection />
      </main>
    </Layout>
  );
}
