import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocalizedCategories, useLocalizedComponentDemos } from '../i18n/hooks';
import styles from './style/quickstart-page.module.less';

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
