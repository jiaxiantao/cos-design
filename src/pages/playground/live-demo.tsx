import * as CosDesign from '@/components';
import React, { useMemo, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import FillStage from './fill-stage';
import styles from './style/live-demo.module.less';

const liveScope = {
  React,
  ...CosDesign,
  FillStage,
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useId: React.useId
};

const stripImports = (source: string) =>
  source
    .split('\n')
    .filter((line) => !/^\s*import\s/.test(line))
    .join('\n')
    .trim();

/** 将用户编辑的示例代码转为 react-live 可执行格式 */
export const toLiveCode = (source: string, options?: { fillContainer?: boolean }): string => {
  const body = stripImports(source);
  if (!body) return 'render(<div />);';

  const needsRenderCall = /^\s*(const|let|function)\s/.test(body) || /\n\s*(const|let|function)\s/.test(body);
  const wrap = (jsx: string) => (options?.fillContainer ? `<FillStage>\n      ${jsx}\n    </FillStage>` : jsx);

  if (needsRenderCall) {
    // 含独立语句时由示例自行 return；背景铺满在下方用 FillStage 包一层预览根节点
    if (options?.fillContainer) {
      return `function LiveDemo() {\n${body}\n}\n\nrender(<FillStage><LiveDemo /></FillStage>);`;
    }
    return `function LiveDemo() {\n${body}\n}\n\nrender(<LiveDemo />);`;
  }

  return `function LiveDemo() {\n  return (\n    ${wrap(body)}\n  );\n}\n\nrender(<LiveDemo />);`;
};

interface LiveDemoPlaygroundProps {
  editorCode: string;
  onEditorCodeChange: (code: string) => void;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
  editorRef?: RefObject<HTMLDivElement | null>;
  /** 背景动效预览叠加层（Demo Content） */
  demoContent?: ReactNode;
}

const LiveDemoPlayground = ({
  editorCode,
  onEditorCodeChange,
  onCopy,
  copied,
  onReset,
  editorRef,
  demoContent
}: LiveDemoPlaygroundProps) => {
  const { t } = useTranslation();
  const fillContainer = Boolean(demoContent);
  const liveCode = useMemo(() => toLiveCode(editorCode, { fillContainer }), [editorCode, fillContainer]);

  return (
    <>
      <LiveProvider code={liveCode} scope={liveScope} noInline language="tsx">
        {/* liveStage 只包 LivePreview，避免把绝对定位的 Demo Content 也改成 relative 而挤到下方 */}
        <div className={`${styles.livePreview} ${fillContainer ? styles.livePreviewBackground : ''}`}>
          <div className={styles.liveStage}>
            <LivePreview />
          </div>
          {demoContent}
        </div>
        <LiveError className={styles.liveError} />
      </LiveProvider>

      <div ref={editorRef} className={styles.codeSection}>
        <div className={styles.codeHeader}>
          <span>{t('liveDemo.editorTitle')}</span>
          <div className={styles.codeActions}>
            <button type="button" className={styles.actionBtn} onClick={onReset}>
              {t('liveDemo.reset')}
            </button>
            <button type="button" className={styles.actionBtn} onClick={onCopy}>
              {copied ? t('liveDemo.copied') : t('liveDemo.copy')}
            </button>
          </div>
        </div>
        <textarea
          className={styles.editor}
          value={editorCode}
          onChange={(e) => onEditorCodeChange(e.target.value)}
          spellCheck={false}
        />
        <p className={styles.hint}>{t('liveDemo.hint')}</p>
      </div>
    </>
  );
};

export default LiveDemoPlayground;
