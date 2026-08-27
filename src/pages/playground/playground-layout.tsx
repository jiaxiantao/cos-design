import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router-dom';
import type { ComponentCategory } from '../config/categories';
import { SUPPORTED_LOCALES, useLocale } from '../i18n';
import { useLocalizedCategories, useLocalizedComponentDemos } from '../i18n/hooks';
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

const LanguageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9h17M3.5 15h17M12 3c2.1 2.3 3.2 5.3 3.2 9S14.1 18.7 12 21M12 3C9.9 5.3 8.8 8.3 8.8 12S9.9 18.7 12 21" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="m4 6 4 4 4-4" />
  </svg>
);

const PlaygroundLayout = () => {
  const { pathname } = useLocation();
  const { query, setQuery } = usePlaygroundSearch();
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const categories = useLocalizedCategories();
  const componentDemos = useLocalizedComponentDemos();
  const [expandedCategory, setExpandedCategory] = useState<ComponentCategory | null>(null);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const localeMenuRef = useRef<HTMLDivElement>(null);

  const currentDemo = useMemo(() => componentDemos.find((item) => item.path === pathname), [componentDemos, pathname]);

  const activeCategory = currentDemo?.category ?? expandedCategory;

  useEffect(() => {
    document.title = t('documentTitle');
  }, [t]);

  useEffect(() => {
    if (!localeMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!localeMenuRef.current?.contains(event.target as Node)) setLocaleMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLocaleMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [localeMenuOpen]);

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(categories.map((c) => [c.id, 0])) as Record<ComponentCategory, number>;
    componentDemos.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, [categories, componentDemos]);

  const filteredDemos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return componentDemos;
    return componentDemos.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [componentDemos, query]);

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
            <small>{t('layout.brandTagline')}</small>
          </span>
        </Link>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            <SearchIcon />
          </span>
          <input
            type="search"
            className={styles.search}
            placeholder={t('layout.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.stats}>
          <span className={styles.statBadge}>{t('layout.componentCount', { value: componentDemos.length })}</span>
          <span className={styles.statBadge}>{t('layout.categoryCount', { value: categories.length })}</span>
          <div ref={localeMenuRef} className={styles.localeSwitch}>
            <button
              type="button"
              className={`${styles.localeTrigger} ${localeMenuOpen ? styles.localeTriggerOpen : ''}`}
              onClick={() => setLocaleMenuOpen((open) => !open)}
              aria-label={t('language.label')}
              aria-haspopup="listbox"
              aria-expanded={localeMenuOpen}
            >
              <span className={styles.localeIcon}>
                <LanguageIcon />
              </span>
              <span className={styles.localeLabel}>{t(`language.${locale}`)}</span>
              <span className={styles.localeChevron}>
                <ChevronIcon />
              </span>
            </button>
            {localeMenuOpen && (
              <div className={styles.localeMenu} role="listbox" aria-label={t('language.label')}>
                {SUPPORTED_LOCALES.map((value) => {
                  const selected = value === locale;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`${styles.localeOption} ${selected ? styles.localeOptionSelected : ''}`}
                      onClick={() => {
                        setLocale(value);
                        setLocaleMenuOpen(false);
                      }}
                    >
                      <span>{t(`language.${value}`)}</span>
                      {selected && <span className={styles.localeCheck}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <a
            className={styles.githubLink}
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t('layout.githubAriaLabel')}
            title="GitHub"
          >
            <GitHubIcon />
          </a>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>{t('layout.sidebarTitle')}</p>
          <nav className={styles.categoryNav}>
            <div className={styles.navLinks}>
              <Link to="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>
                {t('layout.navHome')}
              </Link>
              <Link
                to="/catalog"
                className={`${styles.navLink} ${pathname === '/catalog' ? styles.navLinkActive : ''}`}
              >
                {t('layout.navCatalog')}
              </Link>
              <Link
                to="/quickstart"
                className={`${styles.navLink} ${pathname === '/quickstart' ? styles.navLinkActive : ''}`}
              >
                {t('layout.navQuickstart')}
              </Link>
            </div>
            {categories.map((cat) => {
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
