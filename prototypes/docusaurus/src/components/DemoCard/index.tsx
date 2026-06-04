import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';

import type {Demo} from '../../constants/demos';
import styles from './styles.module.css';

export default function DemoCard({demo}: {demo: Demo}): ReactNode {
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {demo.image ? (
          <img
            className={styles.image}
            src={withBaseUrl(demo.image)}
            alt={`${demo.name} demo screenshot`}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <span>{demo.name}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{demo.name}</h3>
        <p className={styles.tagline}>{demo.tagline}</p>
        <div className={styles.actions}>
          {demo.demoUrl ? (
            <Link className={styles.demoLink} href={demo.demoUrl}>
              View live demo
            </Link>
          ) : (
            <span className={styles.comingSoon}>Demo coming soon</span>
          )}
          <Link className={styles.sourceLink} href={demo.repoUrl}>
            View source
          </Link>
        </div>
      </div>
    </article>
  );
}
