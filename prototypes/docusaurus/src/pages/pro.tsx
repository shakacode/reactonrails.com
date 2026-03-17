import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './pro.module.css';

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
            <h1>React on Rails Pro</h1>
            <p>
              Pro extends React on Rails for teams that need higher SSR throughput and guided
              production support. You can evaluate Pro without a license.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary button--lg" to="/docs/pro">
                Try Pro Free (No License)
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="https://www.shakacode.com/react-on-rails-pro/">
                Contact ShakaCode
              </Link>
            </div>
          </div>
        </section>

        <section className="container">
          <div className={styles.policyCard}>
            <h2>Friendly Evaluation Policy</h2>
            <p>
              You can try React on Rails Pro without a license while evaluating.
            </p>
            <p>
              If your organization is budget-constrained, email{' '}
              <a href="mailto:justin@shakacode.com">justin@shakacode.com</a>. We can grant free
              licenses in qualifying cases.
            </p>
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
            Need pricing, implementation guidance, or a free-license discussion? Email{' '}
            <a href="mailto:justin@shakacode.com">justin@shakacode.com</a>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
