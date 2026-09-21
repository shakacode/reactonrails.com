import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './pricing.module.css';

const LICENSE_URL =
  'https://github.com/shakacode/react_on_rails/blob/main/REACT-ON-RAILS-PRO-LICENSE.md';

const pageCopy = {
  title: 'Pricing',
  description:
    'React on Rails is MIT. React on Rails Pro is free for small organizations and free uses; larger organizations subscribe for production use.',
  hero:
    'React on Rails is open source under the MIT License. React on Rails Pro is trust-based: most uses are free under The React on Rails Pro License, and production use by larger organizations is one flat subscription per organization.',
};

const pricingCards = [
  {
    tag: 'Open source',
    title: 'React on Rails',
    price: 'Free, MIT',
    bullets: [
      {
        id: 'rails-views',
        content: 'React components in Rails views, with server rendering',
      },
      {id: 'bundling', content: 'Auto-bundling, Rspack, and Shakapacker'},
      {id: 'license', content: 'The same license as Inertia Rails: MIT, forever'},
    ],
    actions: [
      {
        label: 'Create a React on Rails app',
        destination: docsRoutes.createApp,
        primary: true,
      },
    ],
  },
  {
    tag: 'Free',
    title: 'React on Rails Pro for small organizations and free uses',
    price: 'Free',
    bullets: [
      {
        id: 'environments',
        content: 'Development, test, CI, staging, and review apps, for everyone, no license key',
      },
      {
        id: 'free-work',
        content: 'Education, personal projects, and open-source work',
      },
      {id: 'evaluation', content: 'A 45-day production evaluation per organization'},
      {
        id: 'small-organizations',
        content: (
          <>
            Full production use for small organizations as defined in{' '}
            <a href={LICENSE_URL}>the license</a>: under 10 people, under $1M revenue, under $1M
            raised
          </>
        ),
      },
      {
        id: 'public-benefit',
        content: 'Charities, educational institutions, and hospitals at any size',
      },
    ],
    actions: [
      {label: 'Install Pro', destination: docsRoutes.proInstall, primary: true},
      {
        label: 'Register for free',
        destination: 'https://pro.reactonrails.com/',
        primary: false,
      },
    ],
  },
  {
    tag: 'Subscription',
    title: 'Larger organizations',
    price: '$1,800 per year per organization',
    bullets: [
      {
        id: 'production',
        content: 'Production use beyond the small-organization line',
      },
      {
        id: 'coverage',
        content: 'Every application, environment, and developer in your organization',
      },
      {id: 'key', content: 'A license key that marks your pages Licensed'},
      {id: 'support', content: 'Updates and support from the maintainers'},
      {
        id: 'shakaperf',
        content:
          'ShakaPerf production use for your organization is included (under 250 people and under $10M revenue)',
      },
    ],
    actions: [
      {
        label: 'Subscribe at pro.reactonrails.com',
        destination: 'https://pro.reactonrails.com/',
        primary: true,
      },
    ],
  },
];

const noteParagraphs = [
  {
    id: 'license-line',
    content: (
      <>
        Not sure which side of the line you are on? The license asks three questions about your
        organization, counted with affiliates: team size, revenue, and outside capital. The
        authoritative definitions are in{' '}
        <a href={LICENSE_URL}>REACT-ON-RAILS-PRO-LICENSE.md</a>. When in doubt, email{' '}
        <a href="mailto:contact@shakacode.com">contact@shakacode.com</a> and we will sort it out in
        one reply.
      </>
    ),
  },
  {
    id: 'consultation',
    content: (
      <>
        Want help with the upgrade itself?{' '}
        <a href="https://meetings.hubspot.com/justingordon/30-minute-consultation">
          Book a free 30-minute consultation.
        </a>
      </>
    ),
  },
];

const comparison = {
  title: 'Comparing with Inertia Rails?',
  description:
    'React on Rails and Inertia Rails are both MIT. The only paid part of this stack is React on Rails Pro, and only in production at organizations above the small-organization line. That subscription buys what Inertia Rails does not have today: React Server Components, streaming SSR with selective hydration, fragment caching, and per-component adoption inside existing Rails views. Already on Inertia? Both gems coexist in one app, so you can migrate route by route.',
  links: [
    {label: 'Migrating from Inertia Rails', destination: docsRoutes.migrateFromInertiaRails},
    {
      label: 'Full comparison',
      destination: '/docs/getting-started/comparing-react-on-rails-to-alternatives',
    },
  ],
  columns: ['Inertia Rails', 'React on Rails', 'React on Rails Pro'],
  rows: [
    {
      label: 'License',
      values: ['MIT', 'MIT', 'Trust-based; free below the small-organization line'],
    },
    {
      label: 'Price in production',
      values: [
        'Free',
        'Free',
        'Free for small organizations, charities, schools, and hospitals; $1,800 per year per organization otherwise',
      ],
    },
    {label: 'React Server Components', values: ['No', 'No', 'Yes']},
    {
      label: 'Streaming SSR with selective hydration',
      values: ['No (opt-in SSR renders the whole page first)', 'No', 'Yes'],
    },
    {
      label: 'Fragment caching of rendered components',
      values: ['No', 'No', 'Yes'],
    },
    {
      label: 'React in existing ERB or Haml views, one component at a time',
      values: ['No (a route is all Inertia or all Rails)', 'Yes', 'Yes'],
    },
    {
      label: 'React Router or TanStack Router',
      values: ['Not compatible by design', 'Yes', 'Yes, with SSR'],
    },
  ],
};

const finePrint = (
  <>
    No license key is required to run React on Rails Pro; a missing key only changes one HTML
    comment. Sponsorships are appreciated but are not subscriptions and grant no production-use
    rights. Once a version ships under given terms, those terms govern that version permanently.
    Questions: <a href="mailto:contact@shakacode.com">contact@shakacode.com</a>.
  </>
);

export default function PricingPage(): ReactNode {
  return (
    <Layout title={pageCopy.title} description={pageCopy.description}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.hero}</p>
          </div>
        </section>

        <section className="container">
          <div className={styles.grid}>
            {pricingCards.map((card) => (
              <article className={styles.card} key={card.title}>
                <span className={styles.cardTag}>{card.tag}</span>
                <h2>{card.title}</h2>
                <p className={styles.price}>{card.price}</p>
                <ul>
                  {card.bullets.map((bullet) => (
                    <li key={bullet.id}>{bullet.content}</li>
                  ))}
                </ul>
                <div className={styles.cardActions}>
                  {card.actions.map((action) => (
                    <Link
                      className={
                        action.primary
                          ? 'button button--primary'
                          : styles.secondaryAction
                      }
                      key={action.label}
                      to={action.destination}>
                      {action.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className={styles.note}>
            {noteParagraphs.map((paragraph) => (
              <p key={paragraph.id}>{paragraph.content}</p>
            ))}
          </div>

          <section className={styles.comparison}>
            <h2>{comparison.title}</h2>
            <p>{comparison.description}</p>
            <div className={styles.comparisonLinks}>
              {comparison.links.map((link) => (
                <Link key={link.label} to={link.destination}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th scope="col" />
                    {comparison.columns.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {row.values.map((value, index) => (
                        <td key={comparison.columns[index]}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className={styles.fine}>{finePrint}</p>
        </section>
      </main>
    </Layout>
  );
}
