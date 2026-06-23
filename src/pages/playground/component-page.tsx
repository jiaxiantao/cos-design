import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { getCategoryMeta } from '../config/categories';
import { componentDemos } from '../config/components';
import { demoComponents } from '../config/demo-components';
import styles from './style/component-page.module.less';

const ComponentPage = () => {
  const { pathname } = useLocation();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const currentIndex = componentDemos.findIndex((item) => item.path === pathname);
  const current = componentDemos[currentIndex];

  const next = useMemo(() => {
    if (!current) return null;
    const sameCategory = componentDemos.filter((item) => item.category === current.category);
    const idx = sameCategory.findIndex((item) => item.path === pathname);
    return sameCategory[idx + 1] ?? null;
  }, [current, pathname]);

  if (!current) {
    return <Navigate to="/" replace />;
  }

  const categoryMeta = getCategoryMeta(current.category);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(current.codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link to="/" className={styles.back}>
              ← 返回目录
            </Link>
            <span className={styles.categoryTag} style={{ '--tag-color': categoryMeta.accent } as CSSProperties}>
              {categoryMeta.label}
            </span>
            <button type="button" className={styles.codeBtn} onClick={() => setShowCode((v) => !v)}>
              {showCode ? '隐藏代码' : '查看代码'}
            </button>
          </div>
          <h1 className={styles.name}>{current.name}</h1>
          <p className={styles.desc}>{current.description}</p>
        </header>

        <div className={styles.preview}>{demoComponents[current.name] ?? <p>演示暂未配置</p>}</div>

        {showCode && (
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <span>使用示例</span>
              <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className={styles.codeBlock}>
              <code>{current.codeExample}</code>
            </pre>
          </div>
        )}

        {next && (
          <footer className={styles.footer}>
            <Link to={next.path} className={styles.nextLink}>
              {next.name} →
            </Link>
          </footer>
        )}
      </article>
    </div>
  );
};

export default ComponentPage;
