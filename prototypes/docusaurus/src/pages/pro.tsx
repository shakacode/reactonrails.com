import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './pro.module.css';

const proFeatures = [
  {
    title: 'React Server Components',
    description:
      'Render and stream React Server Components from Rails to ship interactive UI with dramatically less client JavaScript.',
  },
  {
    title: 'Streaming SSR',
    description:
      'Progressively stream server-rendered HTML so the first paint does not wait on the slowest part of the page.',
  },
  {
    title: 'Fragment caching',
    description:
      'Cache rendered React output on server-rendering paths to cut repeat render cost on your hottest pages.',
  },
  {
    title: 'Dedicated Node renderer',
    description:
      'Run server rendering in a concurrent Node.js process for higher SSR throughput than single-threaded ExecJS.',
  },
  {
    title: 'Code splitting + bundle caching',
    description:
      'Loadable-component code splitting with SSR-aware bundle caching for large client bundles.',
  },
];

const proofLinks = [
  {
    title: 'Live RSC performance demo',
    description:
      'LocalHub, a sample marketplace built on Pro + RSC, with Lighthouse reports and bundle-size evidence you can inspect.',
    href: 'https://rsc.reactonrails.com/search-performance',
    cta: 'Open the demo dashboard',
  },
  {
    title: 'Marketplace demo + performance guide',
    description:
      'The full public source for the LocalHub demo, including the performance guide that walks through the RSC results.',
    href: 'https://github.com/shakacode/react-on-rails-demo-marketplace-rsc',
    cta: 'Open the repository',
  },
  {
    title: 'Pro example app',
    description:
      'A real Rails app in the repo that exercises the Node renderer, caching, and SSR workflows end to end.',
    href: 'https://github.com/shakacode/react_on_rails/blob/main/react_on_rails_pro/spec/dummy/README.md',
    cta: 'Inspect the example app',
  },
];

const upgradeSteps = [
  {
    step: '1',
    title: 'Add the gem and package',
    description:
      'Run bundle add react_on_rails_pro and add the npm package. Both are public on RubyGems and npm — no token or account required to start.',
  },
  {
    step: '2',
    title: 'Turn on the features you need',
    description:
      'Enable RSC, streaming SSR, fragment caching, or the Node renderer on the paths where they actually help.',
  },
  {
    step: '3',
    title: 'Validate, then license for production',
    description:
      'Confirm production rendering and performance on the paths that matter, then add a license when you deploy.',
  },
];

export default function ProPage(): ReactNode {
  return (
    <Layout title="React on Rails Pro" description="React on Rails Pro features and upgrade path">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>An additive layer on open-source React on Rails</p>
            <h1>React on Rails Pro</h1>
            <p>
              Pro builds on the open-source gem with React Server Components, streaming SSR, fragment
              caching, and a dedicated Node renderer. The gem and npm package are public — install
              them and start building today. A license is only required when you deploy to
              production.
            </p>
            <code className={styles.install}>bundle add react_on_rails_pro</code>
            <div className={styles.licenseHighlight}>
              <strong>Free to build with</strong>
              <span>
                No token needed for development, test, CI/CD, or staging. With no license configured,
                Pro keeps running and logs its license status instead of ever blocking your app.
                Production deployments need a paid license, which includes maintainer support.
              </span>
            </div>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to={docsRoutes.proUpgrade}>
                Start building with Pro
              </Link>
              <Link
                className="button button--secondary button--lg"
                href="https://rsc.reactonrails.com/search-performance">
                See the live RSC demo
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
            Everything below comes from the open-source stack plus the public Pro gem. There is no
            paywall — a license covers production use and support, not access.
          </p>
          <div className={styles.cardGrid}>
            {proFeatures.map((feature) => (
              <article className={styles.featureCard} key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container">
          <h2>See everything before you commit</h2>
          <p className={styles.note}>
            The docs, demos, and example apps are all open. Inspect the real performance evidence and
            source before you talk to us about a license.
          </p>
          <div className={styles.cardGrid}>
            {proofLinks.map((proof) => (
              <article className={styles.featureCard} key={proof.title}>
                <h3>{proof.title}</h3>
                <p>{proof.description}</p>
                <Link className={styles.cardLink} href={proof.href}>
                  {proof.cta}
                </Link>
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
              <p className={styles.cardEyebrow}>Friendly license model</p>
              <h2>Build now. License when you ship.</h2>
              <p>
                Try every Pro feature freely in development, test, CI/CD, and staging. With no license
                configured, Pro keeps running in unlicensed mode and logs its status — it never blocks
                your app.
              </p>
              <p>
                Production deployments require a paid license, which includes support from the
                ShakaCode maintainers. Visit{' '}
                <a href="https://pro.reactonrails.com/">Pro pricing and sign up</a> for current
                options.
              </p>
              <p>
                Budget-constrained? Email{' '}
                <a href="mailto:justin@shakacode.com">justin@shakacode.com</a> — we grant free or
                low-cost licenses in qualifying cases. Licenses from larger companies fund continued
                React on Rails development.
              </p>
            </article>
          </div>
          <p className={styles.note}>
            Questions about pricing, implementation, or a free license? Visit{' '}
            <a href="https://pro.reactonrails.com/">Pro pricing and sign up</a> or{' '}
            <a href="/docs/pro">the Pro docs landing page</a>. Want proof first? Open the{' '}
            <a href="https://rsc.reactonrails.com/search-performance">RSC performance dashboard</a>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
