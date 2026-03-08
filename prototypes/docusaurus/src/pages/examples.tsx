import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './examples.module.css';

const exampleApps = [
  {
    title: 'react_on_rails_demo_ssr_hmr',
    description:
      'Canonical demo app showing React on Rails setup with SSR and hot reloading workflows.',
    href: 'https://github.com/shakacode/react_on_rails_demo_ssr_hmr',
  },
  {
    title: 'react-webpack-rails-tutorial',
    description:
      'Tutorial app and migration references that cover practical upgrade and integration patterns.',
    href: 'https://github.com/shakacode/react-webpack-rails-tutorial',
  },
  {
    title: 'react-rails-example-app',
    description:
      'Example migration path from react-rails to react_on_rails used in migration docs.',
    href: 'https://github.com/shakacode/react-rails-example-app',
  },
];

export default function ExamplesPage(): ReactNode {
  return (
    <Layout title="Examples" description="React on Rails example applications and references">
      <main className={styles.main}>
        <section className="container">
          <h1>Examples</h1>
          <p>
            Start from these repositories when evaluating setup, migration patterns, and production
            architecture choices.
          </p>
          <div className={styles.grid}>
            {exampleApps.map((app) => (
              <article className={styles.card} key={app.title}>
                <h2>{app.title}</h2>
                <p>{app.description}</p>
                <p>
                  <Link to={app.href}>Open repository</Link>
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
