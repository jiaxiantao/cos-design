import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { componentDemos } from '../config/components';
import styles from './style/index.module.less';

const Home = () => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return componentDemos;
    return componentDemos.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.title.includes(q) ||
        item.description.includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <p className={styles.badge}>Dev Playground</p>
        <h1 className={styles.title}>cos-design</h1>
        <p className={styles.subtitle}>React 组件库开发预览 · 共 {componentDemos.length} 个组件</p>
        <div className={styles.searchWrap}>
          <input
            type="search"
            className={styles.search}
            placeholder="搜索组件名称、描述或标签…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <span className={styles.searchCount}>找到 {filtered.length} 个</span>}
        </div>
      </header>

      <main className={styles.grid}>
        {filtered.map((item) => (
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

      {filtered.length === 0 && <p className={styles.empty}>没有匹配的组件，试试其他关键词</p>}

      <footer className={styles.footer}>
        <p>选择上方卡片进入对应组件演示页</p>
      </footer>
    </div>
  );
};

export default Home;
