import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { recipes } from '../config/recipes';
import styles from './style/recipes.module.less';

const RecipesPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t('recipes.eyebrow')}</p>
        <h1>{t('recipes.title')}</h1>
        <p className={styles.subtitle}>{t('recipes.subtitle')}</p>
      </header>

      <div className={styles.grid}>
        {recipes.map((recipe) => (
          <Link key={recipe.id} to={recipe.path} className={styles.card}>
            <h2>{t(recipe.titleKey)}</h2>
            <p>{t(recipe.descriptionKey)}</p>
            <div className={styles.tags}>
              {recipe.components.map((name) => (
                <span key={name} className={styles.tag}>
                  {name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecipesPage;
