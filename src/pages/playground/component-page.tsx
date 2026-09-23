import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { demoComponents } from '../config/demo-components';
import BackgroundDemoContent from './background-demo-content';
import FillStage from './fill-stage';
import FrameworkPreview from './framework-preview';
import { buildFrameworkSnippets, FRAMEWORK_TABS, type FrameworkId } from './framework-snippets';
import {
  useBackgroundDemoCopy,
  useLocalizedCategories,
  useLocalizedComponentDemos,
} from '../i18n/hooks';
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
  const { t } = useTranslation();
  const categories = useLocalizedCategories();
  const componentDemos = useLocalizedComponentDemos();
  const [copied, setCopied] = useState(false);
  const [installCopied, setInstallCopied] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [framework, setFramework] = useState<FrameworkId>('react');
  const [editSession, setEditSession] = useState<{ path: string; code: string } | null>(null);
  const [frameworkPath, setFrameworkPath] = useState(pathname);
  if (pathname !== frameworkPath) {
    setFrameworkPath(pathname);
    setFramework('react');
    setEditSession(null);
  }
  const copyTimerRef = useRef(0);
  const installTimerRef = useRef(0);
  const aiTimerRef = useRef(0);
  const snippetTimerRef = useRef(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const shouldScrollToEditor = useRef(false);

  const currentIndex = componentDemos.findIndex((item) => item.path === pathname);
  const current = componentDemos[currentIndex];
  const scopedPackage = current ? toScopedPackageName(current.path) : '';
  const installCmd = scopedPackage ? `pnpm add ${scopedPackage}` : '';
  const isBackground = current?.category === 'background';
  /**
   * 静态预览：
   * - Weather 在自家 Demo 内挂载 FillStage + 文案 + 调试器（仅 React）
   * - 其它背景组件由页面叠加 Demo Content
   * - 非 React Tab：所有背景（含 Weather）统一 FillStage + 示例文案
   */
  const showStaticDemoContent = isBackground && current?.name !== 'WeatherBackground';
  const showFrameworkDemoContent = isBackground;
  const showLiveDemoContent = isBackground;
  const fillStaticPreview = isBackground;
  const demoCopy = useBackgroundDemoCopy(current?.name ?? '');

  const showCode = framework === 'react' && editSession?.path === pathname;
  const editorCode = showCode ? editSession.code : (current?.codeExample ?? '');

  const snippets = useMemo(() => {
    if (!current) return null;
    return buildFrameworkSnippets(current.name, current.codeExample);
  }, [current]);

  const activeSnippet = snippets?.[framework] ?? '';

  const next = useMemo(() => {
    if (!current) return null;
    const sameCategory = componentDemos.filter((item) => item.category === current.category);
    const idx = sameCategory.findIndex((item) => item.path === pathname);
    return sameCategory[idx + 1] ?? null;
  }, [componentDemos, current, pathname]);

  useEffect(
    () => () => {
      clearTimeout(copyTimerRef.current);
      clearTimeout(installTimerRef.current);
      clearTimeout(aiTimerRef.current);
      clearTimeout(snippetTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!showCode || !shouldScrollToEditor.current) return;
    shouldScrollToEditor.current = false;
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [showCode, pathname]);

  if (!current) {
    return <Navigate to="/catalog" replace />;
  }

  const categoryMeta = categories.find((category) => category.id === current.category)!;

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

  const handleCopySnippet = async () => {
    await navigator.clipboard.writeText(activeSnippet);
    setSnippetCopied(true);
    clearTimeout(snippetTimerRef.current);
    snippetTimerRef.current = window.setTimeout(() => setSnippetCopied(false), 2000);
  };

  const buildAiPrompt = () => {
    const demoUrl = `https://jiaxiantao.github.io/cos-design/#${current.path}`;
    return [
      `# Use cos-design: ${current.name}`,
      '',
      current.description,
      '',
      '## Install',
      '',
      '```bash',
      installCmd,
      '# or: pnpm add cos-design',
      '```',
      '',
      '## Example (React default · also /vue · /core · /element)',
      '',
      '```tsx',
      current.codeExample.trim(),
      '```',
      '',
      '## Rules',
      '',
      '- Styles auto-inject — do not import CSS manually.',
      '- Canvas/WebGL: client-only in Next.js (`dynamic(..., { ssr: false })`).',
      '- Pass explicit `width` / `height` for canvas components.',
      '- One strong background + limited focal effects per page.',
      '',
      '## Docs',
      '',
      `- Demo: ${demoUrl}`,
      '- AI index: https://jiaxiantao.github.io/cos-design/llms.txt',
      '- Context7: /jiaxiantao/cos-design',
      '',
    ].join('\n');
  };

  const handleCopyForAi = async () => {
    await navigator.clipboard.writeText(buildAiPrompt());
    setAiCopied(true);
    clearTimeout(aiTimerRef.current);
    aiTimerRef.current = window.setTimeout(() => setAiCopied(false), 2000);
  };

  const handleToggleCode = () => {
    if (showCode) {
      setEditSession(null);
      return;
    }
    setFramework('react');
    shouldScrollToEditor.current = true;
    setEditSession({ path: pathname, code: current.codeExample });
  };

  const handleReset = () => {
    setEditSession({ path: pathname, code: current.codeExample });
  };

  const handleFrameworkChange = (nextFramework: FrameworkId) => {
    setFramework(nextFramework);
    if (nextFramework !== 'react') setEditSession(null);
  };

  const renderPreview = () => {
    // Key by route + framework so React fully remounts/tears down canvas engines
    // when switching sidebar items or framework tabs (ComponentPage instance is reused).
    const previewKey = `${pathname}:${framework}:${current.name}`;

    if (framework === 'react') {
      return (
        <div key={previewKey}>
          {showStaticDemoContent ? (
            <FillStage>{demoComponents[current.name]}</FillStage>
          ) : (
            (demoComponents[current.name] ?? <p>{t('component.demoNotConfigured')}</p>)
          )}
          {showStaticDemoContent ? (
            <BackgroundDemoContent headline={demoCopy.headline} subtitle={demoCopy.subtitle} />
          ) : null}
        </div>
      );
    }

    const preview = (
      <FrameworkPreview
        framework={framework}
        exportName={current.name}
        codeExample={current.codeExample}
        fill={fillStaticPreview}
      />
    );

    if (showFrameworkDemoContent) {
      return (
        <div key={previewKey}>
          <FillStage overlay={<BackgroundDemoContent headline={demoCopy.headline} />}>
            {preview}
          </FillStage>
          {current.name === 'WeatherBackground' ? (
            <p className={styles.frameworkDemoHint}>{t('component.weatherDebuggerHint')}</p>
          ) : null}
        </div>
      );
    }

    return <div key={previewKey}>{preview}</div>;
  };

  return (
    <div className={styles.page}>
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link to="/catalog" className={styles.back}>
              {t('component.backToCatalog')}
            </Link>
            <span
              className={styles.categoryTag}
              style={{ '--tag-color': categoryMeta.accent } as CSSProperties}
            >
              {categoryMeta.label}
            </span>
            {framework === 'react' ? (
              <button type="button" className={styles.codeBtn} onClick={handleToggleCode}>
                {showCode ? t('component.closeEditor') : t('component.editCode')}
              </button>
            ) : null}
          </div>
          <h1 className={styles.name}>{current.name}</h1>
          <p className={styles.desc}>{current.description}</p>
          <div className={styles.installRow}>
            <code className={styles.installCmd}>{installCmd}</code>
            <button type="button" className={styles.installCopyBtn} onClick={handleCopyInstall}>
              {installCopied ? t('component.copied') : t('component.copyInstall')}
            </button>
            <button type="button" className={styles.aiCopyBtn} onClick={handleCopyForAi}>
              {aiCopied ? t('component.copied') : t('component.copyForAi')}
            </button>
          </div>
        </header>

        <div
          className={styles.frameworkBar}
          role="tablist"
          aria-label={t('component.frameworkTabsAria')}
        >
          {FRAMEWORK_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={framework === tab.id}
              className={`${styles.frameworkTab} ${framework === tab.id ? styles.frameworkTabActive : ''}`}
              onClick={() => handleFrameworkChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className={styles.frameworkHint}>{t('component.snippetHint')}</p>

        {showCode ? (
          <LiveDemoPlayground
            editorCode={editorCode}
            onEditorCodeChange={(code) => setEditSession({ path: pathname, code })}
            onCopy={handleCopy}
            copied={copied}
            onReset={handleReset}
            editorRef={editorRef}
            demoContent={
              showLiveDemoContent ? (
                <BackgroundDemoContent headline={demoCopy.headline} subtitle={demoCopy.subtitle} />
              ) : null
            }
          />
        ) : (
          <>
            <div
              className={`${styles.preview} ${fillStaticPreview ? styles.previewBackground : ''}`}
            >
              {renderPreview()}
            </div>
            <div className={styles.snippetPanel}>
              <div className={styles.snippetHeader}>
                <span>
                  {framework === 'react'
                    ? 'TSX'
                    : framework === 'vue'
                      ? 'Vue'
                      : framework === 'element'
                        ? 'HTML'
                        : 'TS'}
                </span>
                <button type="button" className={styles.snippetCopyBtn} onClick={handleCopySnippet}>
                  {snippetCopied ? t('component.copied') : t('component.copySnippet')}
                </button>
              </div>
              <pre className={styles.snippetCode}>
                <code>{activeSnippet}</code>
              </pre>
            </div>
          </>
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
