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
    title: 'Check the free line before production',
    description:
      'Small organizations, charities, schools, and hospitals run Pro in production for free. Larger organizations subscribe at pro.reactonrails.com; one subscription covers every app and developer.',
  },
];

const proLicenseUrl =
  'https://github.com/shakacode/react_on_rails/blob/main/REACT-ON-RAILS-PRO-LICENSE.md';

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
              <strong>
                Free for small organizations and free uses. ShakaStack Pro, $1,800 per year per
                organization, otherwise.
              </strong>
              <span>
                No license key is needed in development, test, CI, staging, or review apps. Production
                is free for organizations under 10 people, $1M revenue, and $1M raised, and for
                charities, schools, and hospitals at any size; larger organizations subscribe. Nothing
                phones home and a missing key never blocks your app. ShakaStack Pro includes React on
                Rails Pro, ShakaPerf and Slack support from the maintainers.
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
            Every feature below ships in the public Pro gem. The license covers production use by
            larger organizations; evaluating, developing, and running Pro at a small organization is
            free.
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
              <h2>Free for most teams. One flat subscription for the rest.</h2>
              <p>
                React on Rails Pro uses The React on Rails Pro License, an application of ShakaCode
                Trust-Based Commercial Licensing: free in development, test, CI, and staging for
                everyone, free in production for small organizations and for charities, schools, and
                hospitals, and $1,800 per year per organization for everyone else. No license key is
                required to run it.
              </p>
              <p>
                See <Link to="/pricing">Free & Pro</Link> for the three questions that define a small
                organization, and the <a href={proLicenseUrl}>full license text</a> on GitHub.
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
