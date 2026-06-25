import * as CosDesign from '@/components';
import React, { useMemo, type RefObject } from 'react';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import styles from './style/live-demo.module.less';

const liveScope = {
  React,
  ...CosDesign,
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
export const toLiveCode = (source: string): string => {
  const body = stripImports(source);
  if (!body) return 'render(<div />);';

  const needsRenderCall = /^\s*(const|let|function)\s/.test(body) || /\n\s*(const|let|function)\s/.test(body);

  if (needsRenderCall) {
    return `function LiveDemo() {\n${body}\n}\n\nrender(<LiveDemo />);`;
  }

  return `function LiveDemo() {\n  return (\n    ${body}\n  );\n}\n\nrender(<LiveDemo />);`;
};

interface LiveDemoPlaygroundProps {
  editorCode: string;
  onEditorCodeChange: (code: string) => void;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
  editorRef?: RefObject<HTMLDivElement | null>;
}

const LiveDemoPlayground = ({
  editorCode,
  onEditorCodeChange,
  onCopy,
  copied,
  onReset,
  editorRef
}: LiveDemoPlaygroundProps) => {
  const liveCode = useMemo(() => toLiveCode(editorCode), [editorCode]);

  return (
    <>
      <LiveProvider code={liveCode} scope={liveScope} noInline language="tsx">
        <div className={styles.livePreview}>
          <LivePreview />
        </div>
        <LiveError className={styles.liveError} />
      </LiveProvider>

      <div ref={editorRef} className={styles.codeSection}>
        <div className={styles.codeHeader}>
          <span>编辑代码 · 实时预览</span>
          <div className={styles.codeActions}>
            <button type="button" className={styles.actionBtn} onClick={onReset}>
              重置
            </button>
            <button type="button" className={styles.actionBtn} onClick={onCopy}>
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>
        <textarea
          className={styles.editor}
          value={editorCode}
          onChange={(e) => onEditorCodeChange(e.target.value)}
          spellCheck={false}
        />
        <p className={styles.hint}>组件已注入作用域，可直接写 JSX；修改后预览区立即更新。</p>
      </div>
    </>
  );
};

export default LiveDemoPlayground;
