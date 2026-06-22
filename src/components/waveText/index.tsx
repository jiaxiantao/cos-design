import React from 'react';
import styles from './style/index.module.less';

export interface WaveTextProps {
  /** 显示文字 */
  text?: string;
  /** 波浪振幅（px） */
  amplitude?: number;
  /** 文字颜色 */
  color?: string;
  /** 字号 */
  fontSize?: number;
}

const WaveText: React.FC<WaveTextProps> = ({ text = 'WAVE', amplitude = 12, color = '#38bdf8', fontSize = 56 }) => {
  return (
    <div className={styles.waveText}>
      <h1
        className={styles.text}
        style={
          {
            fontSize,
            '--wave-color': color,
            '--wave-amp': `${amplitude}px`
          } as React.CSSProperties
        }
      >
        {text.split('').map((char, i) => (
          <span key={`${char}-${i}`} className={styles.char} style={{ animationDelay: `${i * 0.1}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default WaveText;
