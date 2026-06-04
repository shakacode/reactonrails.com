import {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';

import type {Prompt} from '../../constants/prompts';
import styles from './styles.module.css';

export default function PromptCard({prompt}: {prompt: Prompt}): ReactNode {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Clipboard API can be unavailable (insecure context / denied permission).
      // The prompt text is visible on the card, so the user can still select it.
      // Surface the reason instead of failing silently.
      console.warn('Copy to clipboard failed:', error);
    }
  }

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{prompt.title}</h3>
      <p className={styles.prompt}>{prompt.prompt}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.copyButton} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
        <Link className={styles.guideLink} to={prompt.href}>
          Open guide →
        </Link>
      </div>
    </article>
  );
}
