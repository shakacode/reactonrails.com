import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './examples.module.css';

const evaluationPaths = [
  {
    eyebrow: 'Evaluator path',
    title: 'Compare setup approaches',
    description:
      'Start with the docs landing page to choose between new app setup, existing app install, migration, or Pro evaluation.',
    href: docsRoutes.docsGuide,
    cta: 'Open the docs guide',
  },
  {
    eyebrow: 'Migration path',
    title: 'Move from react-rails',
    description:
      'Follow a migration sequence validated against a real open-source example app instead of reconstructing it from old guides.',
    href: docsRoutes.migrateFromReactRails,
    cta: 'Use the react-rails guide',
  },
];

const exampleApps = [
  {
    title: 'react_on_rails_demo_ssr_hmr',
    description:
      'Canonical demo app showing React on Rails setup with SSR and hot reloading workflows.',
    href: 'https://github.com/shakacode/react_on_rails_demo_ssr_hmr',
  },
  {
    title: 'react-rails-example-app',
    description:
      'Legacy react-rails app used to validate the migration guide and current Rails-version constraints.',
    href: 'https://github.com/shakacode/react-rails-example-app',
  },
  {
    title: 'vite_ruby/examples/rails',
    description:
      'Official Vite Rails sample app used to document migration preflight and dependency lockfile issues.',
    href: 'https://github.com/ElMassimo/vite_ruby/tree/main/examples/rails',
  },
];

export default function ExamplesPage(): ReactNode {
  return (
    <Layout title="Examples" description="React on Rails example applications and references">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>Examples and migration references</p>
            <h1>Use concrete repos and concrete guides when deciding whether React on Rails fits.</h1>
            <p className={styles.lead}>
              These links are meant for evaluation, migration, and validation work. They are not a
              parallel docs track.
            </p>
          </div>
        </section>

        <section className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Start with a decision path</p>
            <h2>Choose the guide that matches your migration or evaluation goal.</h2>
          </div>
          <div className={styles.decisionGrid}>
            {evaluationPaths.map((path) => (
              <article className={styles.card} key={path.title}>
                <p className={styles.cardEyebrow}>{path.eyebrow}</p>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <Link className={styles.cardLink} to={path.href}>
                  {path.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Reference repos</p>
            <h2>Open-source apps that map to the docs.</h2>
          </div>
          <div className={styles.grid}>
            {exampleApps.map((app) => (
              <article className={styles.card} key={app.title}>
                <h3>{app.title}</h3>
                <p>{app.description}</p>
                <Link className={styles.cardLink} href={app.href}>
                  Open repository
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
