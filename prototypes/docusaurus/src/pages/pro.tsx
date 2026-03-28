import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './pro.module.css';

const upgradeSteps = [
  {
    step: '1',
    title: 'Compare OSS and Pro',
    description:
      'Decide whether you need higher-throughput SSR, deeper RSC support, or maintainer-backed help.',
  },
  {
    step: '2',
    title: 'Follow the upgrade guide',
    description:
      'Add the Pro gem and package changes without switching to a different product story or docs tree.',
  },
  {
    step: '3',
    title: 'Validate on the paths that matter',
    description:
      'Turn on the Pro features you actually need, then validate production rendering and performance behavior.',
  },
];

const featureRows = [
  {
    feature: 'Open-source Rails + React integration',
    oss: 'Included',
    pro: 'Included',
  },
  {
    feature: 'Node-based server rendering stack',
    oss: 'No',
    pro: 'Included',
  },
  {
    feature: 'Fragment caching helpers for SSR paths',
    oss: 'No',
    pro: 'Included',
  },
  {
    feature: 'React Server Components performance guides',
    oss: 'Docs only',
    pro: 'Included',
  },
  {
    feature: 'Support access with ShakaCode maintainers',
    oss: 'Community channels',
    pro: 'Sponsor support plans',
  },
];

export default function ProPage(): ReactNode {
  return (
    <Layout title="React on Rails Pro" description="React on Rails Pro features and upgrade path">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>Performance tier, not separate product</p>
            <h1>React on Rails Pro</h1>
            <p>
              Pro extends React on Rails for teams that need higher SSR throughput, RSC-oriented
              rendering features, and guided production support. You can evaluate Pro without a
              license.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/pro/upgrading-to-pro">
                Review the upgrade guide
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/getting-started/oss-vs-pro">
                Compare OSS and Pro
              </Link>
              <Link
                className="button button--secondary button--lg"
                href="https://www.shakacode.com/react-on-rails-pro/">
                Contact ShakaCode
              </Link>
            </div>
          </div>
        </section>

        <section className="container">
          <div className={styles.grid}>
            <article className={styles.policyCard}>
              <p className={styles.cardEyebrow}>Upgrade path</p>
              <h2>Three steps from OSS to Pro</h2>
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
              <p className={styles.cardEyebrow}>Friendly evaluation policy</p>
              <h2>Evaluate first, sort licensing second.</h2>
              <p>You can try React on Rails Pro without a license while evaluating.</p>
              <p>
                If your organization is budget-constrained, email{' '}
                <a href="mailto:justin@shakacode.com">justin@shakacode.com</a>. We can grant free
                licenses in qualifying cases.
              </p>
              <p className={styles.note}>
                The goal is to make the upgrade path clear and low-friction, not to force a second
                docs silo.
              </p>
            </article>
          </div>
        </section>

        <section className="container">
          <h2>Feature Comparison</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Open Source</th>
                  <th>Pro</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td>{row.oss}</td>
                    <td>{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            Need pricing, implementation guidance, or a free-license discussion? Visit{' '}
            <a href="/docs/pro">the Pro docs landing page</a>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
