import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import {docsRoutes} from '../constants/docsRoutes';
import styles from './pricing.module.css';

const LICENSE_URL =
  'https://github.com/shakacode/react_on_rails/blob/main/REACT-ON-RAILS-PRO-LICENSE.md';

const pageCopy = {
  layoutTitle: 'Free & Pro',
  title: 'Free for most teams. ShakaStack Pro for the rest.',
  description:
    'React on Rails is MIT. ShakaStack Pro covers React on Rails Pro, ShakaPerf, and Inertia Rails SSR Cache for the whole organization, with no limit on headcount or revenue.',
  hero:
    'React on Rails is open source under the MIT License. ShakaStack Pro includes React on Rails Pro, ShakaPerf, and Inertia Rails SSR Cache for your whole organization, with Slack support, at $1,800 per year per organization. There is no limit on headcount or revenue.',
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
        content: 'React on Rails Pro in development, test, CI, staging, and review apps, for everyone, no license key',
      },
      {
        id: 'free-work',
        content: 'Qualifying public open source work',
      },
      {id: 'evaluation', content: 'A 45-day production evaluation per organization'},
      {
        id: 'small-organizations',
        content: (
          <>
            Full production use when the whole organization, counting affiliates, has fewer than
            10 people, under $1M revenue in the last twelve months, and under $1M raised, ever.
            See <a href={LICENSE_URL}>the license</a>.
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
      {label: 'What Pro adds', destination: '/pro', primary: false, secondary: true},
    ],
  },
  {
    tag: 'ShakaStack Pro',
    title: 'Larger organizations',
    price: '$1,800 per year per organization',
    bullets: [
      {
        id: 'production',
        content: 'React on Rails Pro in production above the free line',
      },
      {
        id: 'shakaperf',
        content: 'ShakaPerf for your whole organization',
      },
      {id: 'inertia', content: 'Inertia Rails SSR Cache for your whole organization'},
      {
        id: 'support',
        content: 'Slack support from the maintainers, plus Zoom and GitHub code review',
      },
      {
        id: 'coverage',
        content: 'Your whole organization: every affiliate, application, environment, repository, and developer',
      },
      {id: 'no-limit', content: 'No limit on headcount or revenue'},
      {id: 'key', content: 'A license key that marks your pages Licensed'},
    ],
    actions: [
      {
        label: 'Subscribe at pro.reactonrails.com',
        destination: 'https://pro.reactonrails.com/#shakastack-pro',
        primary: true,
      },
    ],
  },
];

const noteParagraphs = [
  {
    id: 'development-and-ci',
    content:
      'React on Rails Pro and Inertia Rails SSR Cache are free in development, test, CI, and staging for everyone. Above the free line, what needs a subscription is production: anything that serves real users or supports a live application.',
  },
  {
    id: 'shakaperf-rule',
    content:
      'ShakaPerf follows its own rule in every environment, because it runs in your development process. Above the free line, ongoing ShakaPerf work, including CI, needs ShakaStack Pro after a 45-day evaluation. Qualifying public open-source work stays free, and publishing a result does not make private work free.',
  },
  {
    id: 'existing-subscribers',
    content:
      'Already subscribed to React on Rails Pro? Your subscription counts as ShakaStack Pro. ShakaPerf and Inertia Rails SSR Cache are included for your whole organization, so there is nothing to buy.',
  },
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
    'React on Rails and Inertia Rails are both MIT. ShakaStack Pro covers React on Rails Pro, ShakaPerf, and Inertia Rails SSR Cache for the whole organization. React on Rails Pro adds React Server Components, streaming SSR with selective hydration, fragment caching, and adoption inside existing Rails views. Already on Inertia? Both gems coexist in one app, so you can migrate route by route.',
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
        'Free below the free line and for charities, educational institutions, and hospitals; ShakaStack Pro at $1,800 per year per organization otherwise (React on Rails Pro, ShakaPerf, Inertia Rails SSR Cache, Slack support)',
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
    See the{' '}
    <a href="https://github.com/shakacode/commercial-licensing/blob/main/license/notices/2026-11-shakastack-pro-coverage.md">
      ShakaStack Pro coverage notice
    </a>
    . Questions: <a href="mailto:contact@shakacode.com">contact@shakacode.com</a>.
  </>
);

export default function PricingPage(): ReactNode {
  return (
    <Layout title={pageCopy.layoutTitle} description={pageCopy.description}>
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
                          : 'secondary' in action
                            ? 'button button--secondary'
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
