import type {ReactNode} from 'react';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import type DocBreadcrumbsType from '@theme/DocBreadcrumbs';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import PencilIcon from '../icons/PencilIcon';

import styles from './styles.module.css';

type Props = WrapperProps<typeof DocBreadcrumbsType>;

export default function DocBreadcrumbsWrapper(props: Props): ReactNode {
  const {metadata} = useDoc();
  const {editUrl} = metadata;

  return (
    <div className={styles.breadcrumbRow}>
      <DocBreadcrumbs {...props} />
      {editUrl && (
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.editButton}
          title="Edit this page on GitHub">
          <PencilIcon />
          <span>Edit</span>
        </a>
      )}
    </div>
  );
}
