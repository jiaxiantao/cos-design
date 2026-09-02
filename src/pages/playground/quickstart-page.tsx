import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocalizedCategories, useLocalizedComponentDemos } from '../i18n/hooks';
import styles from './style/quickstart-page.module.less';

const LLMS_TXT = 'https://jiaxiantao.github.io/cos-design/llms.txt';
const LLMS_FULL = 'https://jiaxiantao.github.io/cos-design/llms-full.txt';
const AI_DISCOVERY = 'https://github.com/jiaxiantao/cos-design/blob/master/docs/ai-discovery.md';
const CAMPAIGN_RECIPES = 'https://github.com/jiaxiantao/cos-design/blob/master/docs/campaign-recipes-ai.md';
const CONTEXT7 = 'https://context7.com/jiaxiantao/cos-design';

interface AiTool {
  name: string;
  hint: string;
}

const SINGLE_SNIPPET = `import { WeatherBackground } from '@cos-design/weather-background';
import { Fireworks } from '@cos-design/fireworks';

export default function Page() {
  return (
    <>
      <WeatherBackground weather="thunderstorm" width={800} height={450} />
      <Fireworks width={800} height={500} />
    </>
  );
}`;

const IMPERATIVE_SNIPPET = `import { useRef } from 'react';
import { Fireworks, type FireworksHandle } from 'cos-design';

const ref = useRef<FireworksHandle>(null);
// <Fireworks ref={ref} auto={false} />
// ref.current?.launch();`;

const NAMING_ROWS = [
  { dir: 'weatherBackground', pkg: '@cos-design/weather-background' },
  { dir: 'scratchCard', pkg: '@cos-design/scratch-card' },
  { dir: 'matrixRain', pkg: '@cos-design/matrix-rain' },
  { dir: 'fireworks', pkg: '@cos-design/fireworks' }
];

interface CategoryCard {
  label: string;
  desc: string;
  examples: string;
}

interface QuickstartNote {
  title: string;
  desc: string;
}

const QuickstartPage = () => {
  const { t } = useTranslation();
  const categories = useLocalizedCategories();
  const componentDemos = useLocalizedComponentDemos();
  const categoryCards = t('quickstart.categoryCards', { returnObjects: true }) as CategoryCard[];
  const notes = t('quickstart.notes', { returnObjects: true }) as QuickstartNote[];
  const aiTools = t('quickstart.aiTools', { returnObjects: true }) as AiTool[];
  const [ruleCopied, setRuleCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const ruleTimerRef = useRef(0);
  const promptTimerRef = useRef(0);

  const copyText = async (text: string, setCopied: (v: boolean) => void, timerRef: { current: number }) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('quickstart.eyebrow')}</p>
        <h1 className={styles.title}>{t('quickstart.title')}</h1>
        <p className={styles.subtitle}>{t('quickstart.subtitle')}</p>
        <div className={styles.heroActions}>
          <a
            className={styles.primaryBtn}
            href="https://www.npmjs.com/package/cos-design"
            target="_blank"
            rel="noreferrer"
          >
            {t('quickstart.aggregatePackage')}
          </a>
          <a
            className={styles.secondaryBtn}
            href="https://www.npmjs.com/org/cos-design"
            target="_blank"
            rel="noreferrer"
          >
            {t('quickstart.scopedPackages')}
          </a>
        </div>
      </header>

      <section id="ai" className={styles.aiSection}>
        <div className={styles.aiBadge}>AI</div>
        <h2 className={styles.sectionTitle}>{t('quickstart.aiTitle')}</h2>
        <p className={styles.sectionDesc}>{t('quickstart.aiSubtitle')}</p>

        <div className={styles.copyActions}>
          <button
            type="button"
            className={styles.copyBtn}
            onClick={() => copyText(t('quickstart.snippets.aiRule'), setRuleCopied, ruleTimerRef)}
          >
            {ruleCopied ? t('quickstart.aiCopied') : t('quickstart.aiCopyRule')}
          </button>
          <button
            type="button"
            className={styles.copyBtnSecondary}
            onClick={() => copyText(t('quickstart.snippets.aiPrompt'), setPromptCopied, promptTimerRef)}
          >
            {promptCopied ? t('quickstart.aiCopied') : t('quickstart.aiCopyPrompt')}
          </button>
        </div>

        <h3 className={styles.subHeading}>{t('quickstart.aiToolsTitle')}</h3>
        <div className={styles.toolGrid}>
          {aiTools.map((tool) => (
            <article key={tool.name} className={styles.toolCard}>
              <strong>{tool.name}</strong>
              <span>{tool.hint}</span>
            </article>
          ))}
        </div>

        <h3 className={styles.subHeading}>{t('quickstart.aiResourcesTitle')}</h3>
        <div className={styles.resourceLinks}>
          <a href={LLMS_TXT} target="_blank" rel="noreferrer">
            {t('quickstart.aiResourceLlms')}
          </a>
          <a href={LLMS_FULL} target="_blank" rel="noreferrer">
            {t('quickstart.aiResourceFull')}
          </a>
          <a href={CAMPAIGN_RECIPES} target="_blank" rel="noreferrer">
            {t('quickstart.aiResourceRecipes')}
          </a>
          <a href={AI_DISCOVERY} target="_blank" rel="noreferrer">
            {t('quickstart.aiResourceDiscovery')}
          </a>
          <a href={CONTEXT7} target="_blank" rel="noreferrer">
            {t('quickstart.aiResourceContext7')}
          </a>
        </div>

        <p className={styles.aiHint}>{t('quickstart.aiComponentHint')}</p>

        <h3 className={styles.subHeading}>{t('quickstart.aiSkillInstallTitle')}</h3>
        <pre className={styles.code}>
          <code>{t('quickstart.snippets.aiSkillInstall')}</code>
        </pre>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickstart.installTitle')}</h2>
        <p className={styles.sectionDesc}>{t('quickstart.installReq')}</p>

        <h3 className={styles.subHeading}>{t('quickstart.installMethodA')}</h3>
        <p className={styles.sectionDesc}>{t('quickstart.installMethodADesc')}</p>
        <pre className={styles.code}>
          <code>{t('quickstart.snippets.installFull')}</code>
        </pre>

        <h3 className={styles.subHeading}>{t('quickstart.installMethodB')}</h3>
        <p className={styles.sectionDesc}>{t('quickstart.installMethodBDesc')}</p>
        <pre className={styles.code}>
          <code>{t('quickstart.snippets.installSingle')}</code>
        </pre>
        <div className={styles.namingTable}>
          <div className={styles.namingHead}>
            <span>{t('quickstart.namingDir')}</span>
            <span>{t('quickstart.namingPkg')}</span>
          </div>
          {NAMING_ROWS.map((row) => (
            <div key={row.pkg} className={styles.namingRow}>
              <code>{row.dir}</code>
              <code>{row.pkg}</code>
            </div>
          ))}
        </div>
        <p className={styles.sectionDesc}>
          {t('quickstart.sharedHintBefore')}
          <code className={styles.inlineCode}>@cos-design/shared</code>
          {t('quickstart.sharedHintAfter')}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickstart.usageTitle')}</h2>
        <h3 className={styles.subHeading}>{t('quickstart.usageAggregate')}</h3>
        <p className={styles.sectionDesc}>{t('quickstart.usageAggregateDesc')}</p>
        <pre className={styles.code}>
          <code>{t('quickstart.snippets.basic')}</code>
        </pre>
        <h3 className={styles.subHeading}>{t('quickstart.usageScoped')}</h3>
        <p className={styles.sectionDesc}>
          {t('quickstart.usageScopedBefore')}
          <code className={styles.inlineCode}>@cos-design/*</code>
          {t('quickstart.usageScopedAfter')}
        </p>
        <pre className={styles.code}>
          <code>{SINGLE_SNIPPET}</code>
        </pre>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickstart.categoriesTitle')}</h2>
        <p className={styles.sectionDesc}>
          <Trans
            i18nKey="quickstart.categoriesDesc"
            values={{ components: componentDemos.length, categories: categories.length }}
          />
          <Link to="/catalog" className={styles.inlineLink}>
            {t('quickstart.categoriesCatalogLink')}
          </Link>
          {t('quickstart.categoriesDescAfter')}
        </p>
        <div className={styles.categoryGrid}>
          {categoryCards.map((cat) => (
            <article key={cat.label} className={styles.categoryCard}>
              <h3>{cat.label}</h3>
              <p>{cat.desc}</p>
              <span>{cat.examples}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickstart.notesTitle')}</h2>
        <ul className={styles.noteList}>
          {notes.map((note) => (
            <li key={note.title}>
              <strong>{note.title}</strong>
              <span>{note.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickstart.patternsTitle')}</h2>
        <h3 className={styles.subHeading}>{t('quickstart.patternSsr')}</h3>
        <pre className={styles.code}>
          <code>{t('quickstart.snippets.ssr')}</code>
        </pre>
        <h3 className={styles.subHeading}>{t('quickstart.patternImperative')}</h3>
        <pre className={styles.code}>
          <code>{IMPERATIVE_SNIPPET}</code>
        </pre>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickstart.localDevTitle')}</h2>
        <pre className={styles.code}>
          <code>{t('quickstart.snippets.localDev')}</code>
        </pre>
      </section>
    </div>
  );
};

export default QuickstartPage;
