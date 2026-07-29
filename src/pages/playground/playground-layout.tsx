import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { COMPONENT_CATEGORIES, type ComponentCategory } from '../config/categories';
import { componentDemos } from '../config/components';
import { usePlaygroundSearch } from './search-context';
import cosLogoUrl from '@/assets/icons/cos-logo.svg';
import styles from './style/playground-layout.module.less';

const GITHUB_URL = 'https://github.com/jiaxiantao/cos-design';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

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
          <img className={styles.logo} src={cosLogoUrl} alt="cos-design" />
          <span className={styles.brandText}>
            <strong>cos-design</strong>
            <small>Component Gallery</small>
          </span>
        </Link>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            <SearchIcon />
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
          <a
            className={styles.githubLink}
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="在 GitHub 查看源码"
            title="GitHub"
          >
            <GitHubIcon />
          </a>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>分类导航</p>
          <nav className={styles.categoryNav}>
            <Link
              to="/quickstart"
              className={`${styles.quickstartLink} ${pathname === '/quickstart' ? styles.quickstartLinkActive : ''}`}
            >
              快速开始
            </Link>
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
                            {item.isNew && <span className={styles.newBadge}>NEW</span>}
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
