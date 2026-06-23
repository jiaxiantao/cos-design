import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { COMPONENT_CATEGORIES, type ComponentCategory } from '../config/categories';
import { componentDemos } from '../config/components';
import { usePlaygroundSearch } from './search-context';
import styles from './style/playground-layout.module.less';

const PlaygroundLayout = () => {
  const { pathname } = useLocation();
  const { query, setQuery } = usePlaygroundSearch();
  const [expandedCategory, setExpandedCategory] = useState<ComponentCategory | null>(null);

  const currentDemo = useMemo(() => componentDemos.find((item) => item.path === pathname), [pathname]);

  const activeCategory = currentDemo?.category ?? expandedCategory ?? 'background';

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(COMPONENT_CATEGORIES.map((c) => [c.id, 0])) as Record<ComponentCategory, number>;
    componentDemos.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, []);

  const filteredDemos = useMemo(() => {
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

  const handleCategoryClick = (id: ComponentCategory) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden>
            ✦
          </span>
          <span className={styles.brandText}>
            <strong>cos-design</strong>
            <small>Component Gallery</small>
          </span>
        </Link>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className={styles.search}
            placeholder="搜索组件…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.stats}>
          <span className={styles.statBadge}>{componentDemos.length} 组件</span>
          <span className={styles.statBadge}>{COMPONENT_CATEGORIES.length} 分类</span>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>分类导航</p>
          <nav className={styles.categoryNav}>
            {COMPONENT_CATEGORIES.map((cat) => {
              const items = filteredDemos.filter((item) => item.category === cat.id);
              const isActiveCat = activeCategory === cat.id;
              const isExpanded = isActiveCat || expandedCategory === cat.id || query.length > 0;

              if (query && items.length === 0) return null;

              return (
                <div key={cat.id} className={styles.categoryGroup}>
                  <button
                    type="button"
                    className={`${styles.categoryItem} ${isActiveCat ? styles.categoryItemActive : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <span>{cat.label}</span>
                    <span className={styles.categoryCount}>{categoryCounts[cat.id]}</span>
                  </button>

                  {isExpanded && items.length > 0 && (
                    <ul className={styles.componentList}>
                      {items.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            className={`${styles.componentLink} ${
                              pathname === item.path ? styles.componentLinkActive : ''
                            }`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlaygroundLayout;
