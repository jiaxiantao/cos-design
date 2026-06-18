import { Link } from 'react-router-dom';
import { componentDemos } from '../config/components';
import styles from './style/index.module.less';

const Home = () => {
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <p className={styles.badge}>Dev Playground</p>
        <h1 className={styles.title}>cos-design</h1>
        <p className={styles.subtitle}>React 组件库开发预览 · 共 {componentDemos.length} 个组件</p>
      </header>

      <main className={styles.grid}>
        {componentDemos.map((item) => (
          <Link key={item.name} to={item.path} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardName}>{item.name}</span>
              <span className={styles.cardArrow}>→</span>
            </div>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardDesc}>{item.description}</p>
            <div className={styles.tags}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            <span className={styles.cardPath}>{item.path}</span>
          </Link>
        ))}
      </main>

      <footer className={styles.footer}>
        <p>选择上方卡片进入对应组件演示页</p>
      </footer>
    </div>
  );
};

export default Home;
