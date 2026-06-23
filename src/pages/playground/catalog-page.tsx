import { Link } from 'react-router-dom';
import { COMPONENT_CATEGORIES } from '../config/categories';
import { componentDemos } from '../config/components';
import styles from './style/catalog-page.module.less';

const CatalogPage = () => {
  return (
    <div className={styles.catalog}>
      <div className={styles.hero}>
        <h1 className={styles.title}>组件目录</h1>
        <p className={styles.subtitle}>
          从左侧分类选择组件，或在顶部搜索框快速定位。共 {componentDemos.length} 个视觉特效组件。
        </p>
      </div>

      <div className={styles.grid}>
        {COMPONENT_CATEGORIES.map((cat) => {
          const items = componentDemos.filter((item) => item.category === cat.id);
          return (
            <section key={cat.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{cat.label}</h2>
              <p className={styles.sectionDesc}>{cat.description}</p>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className={styles.link}>
                      <span className={styles.linkName}>{item.name}</span>
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
