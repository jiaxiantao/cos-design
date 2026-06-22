import React from 'react';
import styles from './style/index.module.less';

export interface SplitRevealProps {
  /** 显示文字 */
  text?: string;
  /** 每个字符的延迟间隔（毫秒） */
  delay?: number;
  /** 文字颜色 */
  color?: string;
}

const DIRECTIONS = ['fromTop', 'fromBottom', 'fromLeft', 'fromRight'] as const;

const SplitReveal: React.FC<SplitRevealProps> = ({ text = 'REVEAL', delay = 80, color = '#f8fafc' }) => {
  return (
    <div className={styles.splitReveal}>
      <h1 className={styles.text} style={{ '--reveal-color': color } as React.CSSProperties}>
        {text.split('').map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={`${styles.char} ${styles[DIRECTIONS[i % DIRECTIONS.length]]}`}
            style={{ animationDelay: `${i * delay}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default SplitReveal;
