import { type CSSProperties, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPONENT_CATEGORIES, type ComponentCategory } from '../config/categories';
import { componentDemos } from '../config/components';
import styles from './style/index.module.less';

type FilterCategory = ComponentCategory | 'all';

const Home = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return componentDemos.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.title.includes(q) ||
        item.description.includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    if (activeCategory !== 'all') {
      const meta = COMPONENT_CATEGORIES.find((c) => c.id === activeCategory);
      return meta ? [{ ...meta, items: filtered }] : [];
    }
    return COMPONENT_CATEGORIES.map((cat) => ({
      ...cat,
      items: filtered.filter((item) => item.category === cat.id)
    })).filter((group) => group.items.length > 0);
  }, [filtered, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(COMPONENT_CATEGORIES.map((c) => [c.id, 0])) as Record<ComponentCategory, number>;
    componentDemos.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, []);

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <p className={styles.badge}>v3.0 · Dev Playground</p>
        <h1 className={styles.title}>cos-design</h1>
        <p className={styles.subtitle}>
          React 视觉特效组件库 · 共 {componentDemos.length} 个组件 · {COMPONENT_CATEGORIES.length} 大分类
        </p>

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

        <nav className={styles.categoryNav} aria-label="组件分类">
          <button
            type="button"
            className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.categoryBtnActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            全部
            <span className={styles.categoryCount}>{componentDemos.length}</span>
          </button>
          {COMPONENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.categoryBtnActive : ''}`}
              style={{ '--cat-accent': cat.accent } as CSSProperties}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              <span className={styles.categoryCount}>{categoryCounts[cat.id]}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        {grouped.map((group) => (
          <section key={group.id} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} style={{ '--cat-accent': group.accent } as CSSProperties}>
                {group.label}
              </h2>
              <p className={styles.sectionDesc}>{group.description}</p>
              <span className={styles.sectionCount}>{group.items.length} 个</span>
            </div>
            <div className={styles.grid}>
              {group.items.map((item) => (
                <Link key={item.name} to={item.path} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardName}>{item.name}</span>
                    <span className={styles.cardArrow}>→</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
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
            </div>
          </section>
        ))}
      </main>

      {filtered.length === 0 && <p className={styles.empty}>没有匹配的组件，试试其他关键词或分类</p>}

      <footer className={styles.footer}>
        <p>选择卡片进入组件演示页 · 右侧面板可查看与复制示例代码</p>
      </footer>
    </div>
  );
};

export default Home;
