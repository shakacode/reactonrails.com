import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {PageMetadata} from '@docusaurus/theme-common';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './pro.module.css';

const proFeatures = [
  {
    title: 'React Server Components',
    description:
      'Render React Server Components from Rails and stream their payload to the browser, shipping interactive UI with dramatically less client JavaScript.',
    href: docsRoutes.proReactServerComponents,
  },
  {
    title: 'Streaming SSR with immediate hydration',
    description:
      'stream_react_component flushes server-rendered HTML as each Suspense boundary resolves, and every piece hydrates the moment it streams in — first paint never waits on the slowest data, and the page turns interactive sooner.',
    href: docsRoutes.proStreamingSsr,
  },
  {
    title: 'Concurrent component rendering',
    description:
      'async_react_component renders multiple components in parallel through the Node renderer instead of one after another, cutting response time on component-heavy pages.',
    href: docsRoutes.proAsyncRendering,
  },
  {
    title: 'Streaming-aware caching',
    description:
      'Fragment-cache rendered output — including streamed components — and add prerender caching so cache hits skip props, serialization, and JS execution entirely.',
    href: docsRoutes.proFragmentCaching,
  },
  {
    title: 'Dedicated Node renderer',
    description:
      'A concurrent Fastify-based Node.js renderer pool delivers higher SSR throughput than single-threaded ExecJS, and powers RSC, streaming, and parallel rendering.',
    href: docsRoutes.proNodeRenderer,
  },
  {
    title: 'Code splitting + bundle caching',
    description:
      'Loadable-component code splitting with SSR-aware bundle caching keeps large client bundles fast to build and ship.',
    href: docsRoutes.codeSplitting,
  },
];

const demos = [
  {
    title: 'Marketplace — RSC performance demo',
    description:
      'A marketplace built on Pro + RSC, with Lighthouse reports and bundle-size evidence you can inspect.',
    liveHref: 'https://rsc.reactonrails.com',
    sourceHref: 'https://github.com/shakacode/react-on-rails-demo-marketplace-rsc',
  },
  {
    title: 'TanStack starter — Rails-centered React',
    description:
      'Keep Rails at the center and use Pro for the React paths that need Node: RSC and streaming on public pages, SSR with TanStack Router and Table on app surfaces.',
    liveHref: 'https://starter.reactonrails.com',
    sourceHref: 'https://github.com/shakacode/react-on-rails-starter-tanstack',
  },
];

const upgradeSteps = [
  {
    step: '1',
    title: 'Add the gem and package',
    description:
      'Add react_on_rails_pro and the Node renderer npm package — both public on RubyGems and npm, no account needed to start.',
  },
  {
    step: '2',
    title: 'Turn on the features you need',
    description:
      'Enable RSC, streaming SSR, fragment caching, or the Node renderer on the paths where they actually help.',
  },
  {
    step: '3',
    title: 'Align licensing before production',
    description:
      'Confirm production rendering and performance on the paths that matter, then add a paid license before private business value ships.',
  },
];

export default function ProPage(): ReactNode {
  return (
    <Layout title="React on Rails Pro" description="React on Rails Pro features and upgrade path">
      <PageMetadata image="img/react-on-rails-pro-social-card.png" />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>An additive layer on open-source React on Rails</p>
            <h1>React on Rails Pro</h1>
            <p>
              Pro adds React Server Components, streaming SSR, concurrent and cached rendering, and a
              dedicated Node renderer on top of the open-source gem. The gem and npm package are
              public — install and build today under ShakaCode Trust-Based Commercial Licensing.
            </p>
            <code className={styles.install}>bundle add react_on_rails_pro</code>
            <div className={styles.licenseHighlight}>
              <strong>Free to learn. Paid for private business value.</strong>
              <span>
                No token is required for development, test, CI/CD, and staging, plus demos, education, or
                qualifying open-source projects. Production use that creates private business value
                requires a paid React on Rails Pro license.
              </span>
            </div>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to={docsRoutes.proInstall}>
                Start building with Pro
              </Link>
              <Link className="button button--secondary button--lg" to={docsRoutes.proOverview}>
                Pro docs overview
              </Link>
            </div>
          </div>
        </section>

        <section className="container">
          <h2>What Pro adds</h2>
          <p className={styles.note}>
            Every feature below ships in the public Pro gem. Trust-based commercial licensing covers
            production use and support — not access to evaluate the package.
          </p>
          <div className={styles.cardGrid}>
            {proFeatures.map((feature) => (
              <Link
                className={`${styles.featureCard} ${styles.featureCardLink}`}
                key={feature.title}
                to={feature.href}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="container">
          <h2>See it running, read the source</h2>
          <p className={styles.note}>
            Both demos are public — live apps and full source. Inspect the performance evidence and
            the code before you talk to us about a license.
          </p>
          <div className={styles.demoGrid}>
            {demos.map((demo) => (
              <article className={styles.featureCard} key={demo.title}>
                <h3>{demo.title}</h3>
                <p>{demo.description}</p>
                <div className={styles.cardLinks}>
                  <Link className={styles.cardLink} href={demo.liveHref}>
                    Open the live demo
                  </Link>
                  <Link className={styles.cardLink} href={demo.sourceHref}>
                    View source
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container">
          <div className={styles.grid}>
            <article className={styles.policyCard}>
              <p className={styles.cardEyebrow}>Upgrade path</p>
              <h2>Three steps to build with Pro</h2>
              <ol className={styles.stepList}>
                {upgradeSteps.map((step) => (
                  <li key={step.step}>
                    <span className={styles.stepBadge}>{step.step}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className={styles.policyCard}>
              <p className={styles.cardEyebrow}>Trust-Based Commercial Licensing</p>
              <h2>Free to learn. Paid when it creates private business value.</h2>
              <p>
                React on Rails Pro uses ShakaCode Trust-Based Commercial Licensing: free for
                learning, demos, tutorials, education, and qualifying OSS; paid for production use
                that creates private business value. Visit{' '}
                <a href="https://pro.reactonrails.com/">Pro pricing and sign up</a> for current
                options.
              </p>
              <p>
                The umbrella philosophy is separate from the legal terms: production use remains
                governed by the React on Rails Pro EULA. Budget-constrained? Email{' '}
                <a href="mailto:justin@shakacode.com">justin@shakacode.com</a> about free or
                low-cost licenses in qualifying cases.
              </p>
            </article>
          </div>
          <p className={styles.note}>
            Prefer to talk it through first?{' '}
            <a href="https://meetings.hubspot.com/justingordon/30-minute-consultation">
              Book a 30-minute consultation
            </a>
            .
          </p>
        </section>
      </main>
    </Layout>
  );
}
