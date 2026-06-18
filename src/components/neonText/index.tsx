import React from 'react';
import styles from './style/index.module.less';

export interface NeonTextProps {
  /** 显示文字 */
  text?: string;
  /** 霓虹主色 */
  color?: string;
  /** 字号 */
  fontSize?: number;
  /** 是否闪烁 */
  flicker?: boolean;
}

const NeonText: React.FC<NeonTextProps> = ({ text = 'NEON', color = '#ff00de', fontSize = 72, flicker = true }) => {
  return (
    <div className={styles.neonText}>
      <h1
        className={`${styles.text} ${flicker ? styles.flicker : ''}`}
        style={
          {
            fontSize,
            '--neon-color': color
          } as React.CSSProperties
        }
      >
        {text}
      </h1>
      <p className={styles.reflection} style={{ fontSize: fontSize * 0.35, color }}>
        {text}
      </p>
    </div>
  );
};

export default NeonText;
