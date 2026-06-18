import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './style/index.module.less';

interface DemoLayoutProps {
  title: string;
  children: ReactNode;
}

const DemoLayout = ({ title, children }: DemoLayoutProps) => {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.back}>
          ← 返回首页
        </Link>
        <span className={styles.title}>{title}</span>
      </nav>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default DemoLayout;
