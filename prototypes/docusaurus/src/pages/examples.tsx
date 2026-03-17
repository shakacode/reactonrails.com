import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './examples.module.css';

const evaluationPaths = [
  {
    eyebrow: 'Evaluator path',
    title: 'Compare setup approaches',
    description:
      'Read the evaluator guide first to compare React on Rails with Hotwire/Turbo, Inertia Rails, and react-rails.',
    href: '/docs/getting-started/comparison-with-alternatives',
    cta: 'Open the comparison guide',
  },
  {
    eyebrow: 'Migration path',
    title: 'Move from react-rails',
    description:
      'Follow a migration sequence that now accounts for both Webpacker-era apps and newer Vite-style `react-rails` repos.',
    href: '/docs/migrating/migrating-from-react-rails',
    cta: 'Use the react-rails guide',
  },
  {
    eyebrow: 'Migration path',
    title: 'Move from vite_rails',
    description:
      'Review the Vite migration guide, including the environment and lockfile issues that show up before app-code changes do.',
    href: '/docs/migrating/migrating-from-vite-rails',
    cta: 'Use the vite_rails guide',
  },
  {
    eyebrow: 'Upgrade path',
    title: 'Upgrade an existing react_on_rails app',
    description:
      'Use the upgrade guide when the app already depends on React on Rails and you need the current preflight before version bumps.',
    href: '/docs/upgrading/upgrading-react-on-rails',
    cta: 'Use the upgrade guide',
  },
];

const exampleApps = [
  {
    title: 'ifmeorg/ifme',
    description:
      'React on Rails app on an older Webpacker-era stack that exposed `pg` lockfile issues before the upgrade could begin.',
    href: 'https://github.com/ifmeorg/ifme',
  },
  {
    title: 'antiwork/gumroad',
    description:
      'Modern Rails + Shakapacker + React on Rails app used to validate upgrade preflight guidance and exact-version expectations.',
    href: 'https://github.com/antiwork/gumroad',
  },
  {
    title: 'bigbinary/wheel',
    description:
      'React-rails app with a newer frontend toolchain that proved the migration docs needed a clearer Vite-era branch.',
    href: 'https://github.com/bigbinary/wheel',
  },
  {
    title: 'lockstep/rails_new',
    description:
      'React-rails + Webpacker app that hit an old `nio4r` compile failure before any React on Rails migration steps could run.',
    href: 'https://github.com/lockstep/rails_new',
  },
  {
    title: 'arish-me/rails-vite-wheel',
    description:
      'Small vite_rails app used to validate `packageManager`, env-var, and generator-boot preflight notes.',
    href: 'https://github.com/arish-me/rails-vite-wheel',
  },
];

export default function ExamplesPage(): ReactNode {
  return (
    <Layout title="Examples" description="React on Rails example applications and references">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroLayout)}>
            <div className={styles.heroContent}>
              <p className={styles.kicker}>Examples and migration references</p>
              <h1>Use concrete repos and concrete guides when deciding whether React on Rails fits.</h1>
              <p className={styles.lead}>
                These links are for evaluation, migration, upgrade, and validation work. They are
                supporting material for the docs, not a parallel docs track.
              </p>
              <div className={styles.actions}>
                <Link className="button button--primary button--lg" to="/docs/getting-started/comparison-with-alternatives">
                  Start with comparison
                </Link>
                <Link className="button button--secondary button--lg" to="/docs/upgrading/upgrading-react-on-rails">
                  Review upgrade preflight
                </Link>
              </div>
            </div>
            <aside className={styles.heroPanel}>
              <p className={styles.panelLabel}>Decision sequence</p>
              <ol className={styles.heroSteps}>
                <li>Compare React on Rails with Hotwire, Inertia, and react-rails.</li>
                <li>Open the guide that matches your current stack.</li>
                <li>Validate against a public repo before cutting over your app.</li>
              </ol>
            </aside>
          </div>
        </section>

        <section className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Start with a decision path</p>
            <h2>Choose the guide that matches your migration or evaluation goal.</h2>
          </div>
          <div className={styles.grid}>
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
