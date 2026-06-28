import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';

import {docsRoutes} from '../constants/docsRoutes';
import {featuredDemos} from '../constants/demos';
import {agentNote, homePrompts} from '../constants/prompts';
import DemoCard from '../components/DemoCard';
import PromptCard from '../components/PromptCard';
import styles from './index.module.css';

const valueCards = [
  {
    title: 'Rails-first React',
    description:
      'Render React components from Rails views and controllers without splitting your product into separate apps.',
  },
  {
    title: 'Production SSR',
    description:
      'Use server rendering, hydration, and streaming paths that fit mature Rails deployments.',
  },
  {
    title: 'OSS and Pro',
    description:
      'Start with open source docs, then add Pro when SSR throughput, RSC support, or guided support matters.',
  },
  {
    title: 'Modern data fetching',
    description:
      'Pair Rails JSON APIs with TanStack Query for client-side caching, mutations, and first-paint data, without adding a second backend.',
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
  const heroLogoSrc = useBaseUrl('/img/icon-tile.svg');

  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroLayout)}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>React + Rails Integration</p>
          <div className={styles.heroIdentity}>
            <img
              className={styles.heroLogo}
              src={heroLogoSrc}
              alt="React on Rails logo"
              width="512"
              height="512"
            />
            <h1 className={styles.heroName}>React on Rails</h1>
          </div>
          <p className={styles.subtitle}>
            Official docs for installing, configuring, deploying, and upgrading React on Rails in
            production Rails apps, with SSR, RSC, and React on Rails Pro paths.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to={docsRoutes.docsGuide}>
              Browse docs
            </Link>
            <Link className="button button--secondary button--lg" to="/examples">
              Examples
            </Link>
            <Link className="button button--secondary button--lg" to="/pro">
              React on Rails Pro
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function QuickStartSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader}>
            <h2>Quick Start</h2>
            <p className={styles.quickStartNote}>{agentNote}</p>
          </div>
          <Link className={styles.browseAll} to="/prompts">
            Browse all prompts →
          </Link>
        </div>
        <div className={styles.quickStartGrid}>
          {homePrompts.map((prompt) => (
            <PromptCard prompt={prompt} key={prompt.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveDemosSection() {
  return (
    <section className={styles.sectionSoft}>
      <div className="container">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Live demos</p>
            <h2>See it running</h2>
          </div>
          <Link className={styles.browseAll} to="/examples">
            Browse all demos →
          </Link>
        </div>
        <div className={styles.demoGrid}>
          {featuredDemos.map((demo) => (
            <DemoCard demo={demo} key={demo.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProSection() {
  const proLogoSrc = useBaseUrl('/img/icon-tile.svg');

  return (
    <section className={styles.sectionFeature}>
      <div className={clsx('container', styles.featureLayout)}>
        <img
          className={styles.featureLogo}
          src={proLogoSrc}
          alt="React on Rails Pro logo"
          width="512"
          height="512"
        />
        <div>
          <p className={styles.sectionEyebrow}>React on Rails Pro</p>
          <h2>Higher-throughput SSR and RSC support, same Rails workflow.</h2>
          <p>
            Pro is an upgrade tier for teams that need more rendering throughput, React Server
            Components, streaming, and guided support without replacing their Rails app.
          </p>
          <div className={styles.featureActions}>
            <Link className="button button--primary button--lg" to={docsRoutes.ossVsPro}>
              Compare OSS and Pro
            </Link>
            <Link className="button button--secondary button--lg" to={docsRoutes.proUpgrade}>
              Open upgrade guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueSection() {
  return (
    <section className={styles.sectionSoft}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Why Teams Use It</p>
          <h2>Keep React close to Rails.</h2>
        </div>
        <div className={styles.valueGrid}>
          {valueCards.map((card) => (
            <article className={styles.valueCard} key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
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
        <QuickStartSection />
        <LiveDemosSection />
        <ProSection />
        <ValueSection />
        <TrustedBySection />
        <MigrationSection />
        <TestimonialsSection />
        <ConsultationSection />
      </main>
    </Layout>
  );
}
