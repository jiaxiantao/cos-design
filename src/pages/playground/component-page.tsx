import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { getCategoryMeta } from '../config/categories';
import { componentDemos } from '../config/components';
import { demoComponents } from '../config/demo-components';
import LiveDemoPlayground from './live-demo';
import PropsTable from './props-table';
import styles from './style/component-page.module.less';

/** 路由目录名 → npm 子包名（kebab-case） */
const toScopedPackageName = (path: string) => {
  const dir = path.replace(/^\//, '');
  const id = dir.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `@cos-design/${id}`;
};

const ComponentPage = () => {
  const { pathname } = useLocation();
  const [copied, setCopied] = useState(false);
  const [installCopied, setInstallCopied] = useState(false);
  const [editSession, setEditSession] = useState<{ path: string; code: string } | null>(null);
  const copyTimerRef = useRef(0);
  const installTimerRef = useRef(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const shouldScrollToEditor = useRef(false);

  const currentIndex = componentDemos.findIndex((item) => item.path === pathname);
  const current = componentDemos[currentIndex];
  const scopedPackage = current ? toScopedPackageName(current.path) : '';
  const installCmd = scopedPackage ? `pnpm add ${scopedPackage}` : '';

  const showCode = editSession?.path === pathname;
  const editorCode = showCode ? editSession.code : (current?.codeExample ?? '');

  const next = useMemo(() => {
    if (!current) return null;
    const sameCategory = componentDemos.filter((item) => item.category === current.category);
    const idx = sameCategory.findIndex((item) => item.path === pathname);
    return sameCategory[idx + 1] ?? null;
  }, [current, pathname]);

  useEffect(
    () => () => {
      clearTimeout(copyTimerRef.current);
      clearTimeout(installTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!showCode || !shouldScrollToEditor.current) return;
    shouldScrollToEditor.current = false;
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [showCode, pathname]);

  if (!current) {
    return <Navigate to="/" replace />;
  }

  const categoryMeta = getCategoryMeta(current.category);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorCode);
    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText(installCmd);
    setInstallCopied(true);
    clearTimeout(installTimerRef.current);
    installTimerRef.current = window.setTimeout(() => setInstallCopied(false), 2000);
  };

  const handleToggleCode = () => {
    if (showCode) {
      setEditSession(null);
      return;
    }
    shouldScrollToEditor.current = true;
    setEditSession({ path: pathname, code: current.codeExample });
  };

  const handleReset = () => {
    setEditSession({ path: pathname, code: current.codeExample });
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
            <button type="button" className={styles.codeBtn} onClick={handleToggleCode}>
              {showCode ? '关闭编辑' : '编辑代码'}
            </button>
          </div>
          <h1 className={styles.name}>{current.name}</h1>
          <p className={styles.desc}>{current.description}</p>
          <div className={styles.installRow}>
            <code className={styles.installCmd}>{installCmd}</code>
            <button type="button" className={styles.installCopyBtn} onClick={handleCopyInstall}>
              {installCopied ? '已复制' : '复制安装'}
            </button>
          </div>
        </header>

        {showCode ? (
          <LiveDemoPlayground
            editorCode={editorCode}
            onEditorCodeChange={(code) => setEditSession({ path: pathname, code })}
            onCopy={handleCopy}
            copied={copied}
            onReset={handleReset}
            editorRef={editorRef}
          />
        ) : (
          <div className={styles.preview}>{demoComponents[current.name] ?? <p>演示暂未配置</p>}</div>
        )}

        <PropsTable componentName={current.name} />

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
