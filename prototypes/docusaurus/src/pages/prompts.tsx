import type {ReactNode} from 'react';
import Layout from '@theme/Layout';

import {agentNote, prompts, promptGroups} from '../constants/prompts';
import PromptCard from '../components/PromptCard';
import styles from './prompts.module.css';

export default function PromptsPage(): ReactNode {
  return (
    <Layout
      title="Prompts"
      description="Copy-able AI prompts for setting up and building with React on Rails.">
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.kicker}>AI prompts</p>
            <h1>Start React on Rails with your AI assistant.</h1>
            <p className={styles.lead}>{agentNote}</p>
          </div>
        </section>

        {promptGroups.map((group) => {
          const groupPrompts = prompts.filter((prompt) => prompt.category === group.category);
          if (groupPrompts.length === 0) {
            return null;
          }
          return (
            <section className="container" key={group.category}>
              <div className={styles.sectionHeader}>
                <p className={styles.sectionEyebrow}>{group.eyebrow}</p>
                <h2>{group.heading}</h2>
              </div>
              <div className={styles.grid}>
                {groupPrompts.map((prompt) => (
                  <PromptCard prompt={prompt} key={prompt.id} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </Layout>
  );
}
