import type {ReactNode} from 'react';
import DocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import type DocBreadcrumbsType from '@theme/DocBreadcrumbs';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

import styles from './styles.module.css';

type Props = WrapperProps<typeof DocBreadcrumbsType>;

function PencilIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden="true">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.189 6.25 9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064l6.286-6.286Z" />
    </svg>
  );
}

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
