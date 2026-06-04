import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {demos, type DemoCategory} from '../constants/demos';
import DemoCard from '../components/DemoCard';
import styles from './examples.module.css';

type DemoGroup = {
  category: DemoCategory;
  eyebrow: string;
  heading: string;
};

const demoGroups: DemoGroup[] = [
  {
    category: 'flagship',
    eyebrow: 'Flagship demos',
    heading: 'Production-style apps on React on Rails Pro, React 19, and RSC.',
  },
  {
    category: 'starter',
    eyebrow: 'Get started',
    heading: 'Start a new app from a template.',
  },
  {
    category: 'legacy',
    eyebrow: 'Legacy',
    heading: 'The original full-app tutorial demo.',
  },
];

const productionSites = [
  {
    title: 'HiChee.com',
    description:
      'Production vacation-rental comparison site using React on Rails to help travelers compare Airbnb, Booking.com, Vrbo, and direct-booking prices.',
    href: 'https://hichee.com/',
  },
];

export default function ExamplesPage(): ReactNode {
  return (
    <Layout title="Examples" description="React on Rails demo and starter applications">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>Demos, starters, and production sites</p>
            <h1>
              See React on Rails running in demos and real products.
            </h1>
            <p className={styles.lead}>
              Use live deployments, source-backed demos, and production references to evaluate
              React on Rails, compare OSS and Pro, or start a new app.
            </p>
          </div>
        </section>

        <section className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Production sites</p>
            <h2>Live products built with React on Rails.</h2>
          </div>
          <div className={styles.siteGrid}>
            {productionSites.map((site) => (
              <article className={styles.siteCard} key={site.title}>
                <h3>{site.title}</h3>
                <p>{site.description}</p>
                <Link className={styles.siteLink} href={site.href}>
                  Visit site
                </Link>
              </article>
            ))}
          </div>
        </section>

        {demoGroups.map((group) => {
          const groupDemos = demos.filter((demo) => demo.category === group.category);
          if (groupDemos.length === 0) {
            return null;
          }
          return (
            <section className="container" key={group.category}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>{group.eyebrow}</p>
                <h2>{group.heading}</h2>
              </div>
              <div className={styles.grid}>
                {groupDemos.map((demo) => (
                  <DemoCard demo={demo} key={demo.id} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </Layout>
  );
}
