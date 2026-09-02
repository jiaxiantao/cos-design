import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocalizedCategories, useLocalizedComponentDemos } from '../i18n/hooks';
import cosLogoUrl from '@/assets/icons/cos-logo.svg';
import styles from './style/home-page.module.less';

interface HomeCard {
  title: string;
  desc: string;
}

const HomePage = () => {
  const { t } = useTranslation();
  const categories = useLocalizedCategories();
  const componentDemos = useLocalizedComponentDemos();
  const newCount = componentDemos.filter((item) => item.isNew).length;
  const features = t('home.features', { returnObjects: true }) as HomeCard[];
  const scenarios = t('home.scenarios', { returnObjects: true }) as HomeCard[];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <img className={styles.heroLogo} src={cosLogoUrl} alt="" />
        <p className={styles.eyebrow}>{t('home.eyebrow')}</p>
        <h1 className={styles.title}>{t('home.title')}</h1>
        <p className={styles.subtitle}>
          <Trans i18nKey="home.subtitle" components={{ strong: <strong /> }} />
        </p>

        <div className={styles.heroActions}>
          <Link to="/catalog" className={styles.primaryBtn}>
            {t('home.browseCatalog')}
          </Link>
          <Link to="/quickstart" className={styles.secondaryBtn}>
            {t('layout.navQuickstart')}
          </Link>
          <Link to="/quickstart#ai" className={styles.aiBtn}>
            {t('home.aiTitle')}
          </Link>
          <a
            className={styles.ghostBtn}
            href="https://www.npmjs.com/package/cos-design"
            target="_blank"
            rel="noreferrer"
          >
            {t('home.npmDocs')}
          </a>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <strong>{componentDemos.length}</strong>
            <span>{t('home.metricComponents')}</span>
          </div>
          <div className={styles.metric}>
            <strong>{categories.length}</strong>
            <span>{t('home.metricCategories')}</span>
          </div>
          <div className={styles.metric}>
            <strong>{newCount || '—'}</strong>
            <span>{t('home.metricNew')}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('home.whyTitle')}</h2>
        <div className={styles.featureGrid}>
          {features.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.aiBanner}>
        <div>
          <p className={styles.aiBannerLabel}>AI</p>
          <h2>{t('home.aiTitle')}</h2>
          <p>{t('home.aiDesc')}</p>
        </div>
        <Link to="/quickstart#ai" className={styles.aiBannerBtn}>
          {t('home.aiCta')}
        </Link>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('home.scenariosTitle')}</h2>
        <div className={styles.scenarioGrid}>
          {scenarios.map((item) => (
            <article key={item.title} className={styles.scenarioCard}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t('home.categoriesTitle')}</h2>
          <Link to="/catalog" className={styles.sectionLink}>
            {t('home.viewAll')}
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => {
            const count = componentDemos.filter((item) => item.category === cat.id).length;
            return (
              <Link key={cat.id} to="/catalog" className={styles.categoryCard}>
                <span className={styles.categoryAccent} style={{ background: cat.accent }} />
                <div className={styles.categoryBody}>
                  <div className={styles.categoryTop}>
                    <h3>{cat.label}</h3>
                    <span>{count}</span>
                  </div>
                  <p>{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaDesc')}</p>
        </div>
        <div className={styles.ctaActions}>
          <Link to="/quickstart" className={styles.primaryBtn}>
            {t('home.ctaQuickstart')}
          </Link>
          <Link to="/catalog" className={styles.secondaryBtn}>
            {t('home.ctaCatalog')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
