import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './style/index.module.less';

interface DemoLayoutProps {
  title: string;
  code?: string;
  children: ReactNode;
}

const DemoLayout = ({ title, code, children }: DemoLayoutProps) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.back}>
          ← 返回首页
        </Link>
        <span className={styles.title}>{title}</span>
        {code && (
          <button type="button" className={styles.codeToggle} onClick={() => setShowCode((v) => !v)}>
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
        )}
      </nav>
      <div className={styles.body}>
        <div className={styles.content}>{children}</div>
        {code && showCode && (
          <aside className={styles.codePanel}>
            <div className={styles.codeHeader}>
              <span>使用示例</span>
              <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className={styles.codeBlock}>
              <code>{code}</code>
            </pre>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DemoLayout;
