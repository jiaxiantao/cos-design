import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocalizedCategories, useLocalizedComponentDemos } from '../i18n/hooks';
import styles from './style/catalog-page.module.less';

const CatalogPage = () => {
  const { t } = useTranslation();
  const categories = useLocalizedCategories();
  const componentDemos = useLocalizedComponentDemos();

  return (
    <div className={styles.catalog}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{t('catalog.title')}</h1>
        <p className={styles.subtitle}>{t('catalog.subtitle', { value: componentDemos.length })}</p>
        <div className={styles.bannerRow}>
          <Link to="/" className={styles.homeBanner}>
            <span className={styles.homeLabel}>{t('catalog.homeLabel')}</span>
            <span className={styles.homeText}>{t('catalog.homeText')}</span>
            <span className={styles.quickstartArrow} aria-hidden>
              →
            </span>
          </Link>
          <Link to="/quickstart" className={styles.quickstartBanner}>
            <span className={styles.quickstartLabel}>{t('catalog.quickstartLabel')}</span>
            <span className={styles.quickstartText}>{t('catalog.quickstartText')}</span>
            <span className={styles.quickstartArrow} aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => {
          const items = componentDemos.filter((item) => item.category === cat.id);
          return (
            <section key={cat.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{cat.label}</h2>
              <p className={styles.sectionDesc}>{cat.description}</p>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className={styles.link}>
                      <span className={styles.linkName}>
                        {item.name}
                        {item.isNew && <span className={styles.newBadge}>NEW</span>}
                      </span>
                      <span className={styles.linkTitle}>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogPage;
