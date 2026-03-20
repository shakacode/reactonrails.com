import type {ReactNode} from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';

import styles from './styles.module.css';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): ReactNode {
  return (
    <>
      <Footer {...props} />
      <aside className={styles.consultationCallout}>
        <p className={styles.calloutHeading}>Need help with your React on Rails project?</p>
        <p className={styles.calloutBody}>
          ShakaCode builds and maintains React on Rails. Book a complimentary 30-minute
          consultation to discuss your project with the team.
        </p>
        <a
          className={styles.calloutLink}
          href="https://meetings.hubspot.com/justingordon/30-minute-consultation">
          Book a free consultation
        </a>
      </aside>
    </>
  );
}
