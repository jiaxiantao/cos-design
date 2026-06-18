import React from 'react';
import styles from './style/index.module.less';

export interface GlitchTextProps {
  /** 显示文字 */
  text?: string;
  /** 主色 */
  color?: string;
  /** 故障色 1 */
  glitchColor1?: string;
  /** 故障色 2 */
  glitchColor2?: string;
  /** 字号 */
  fontSize?: number;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  text = 'GLITCH',
  color = '#f8fafc',
  glitchColor1 = '#ff00de',
  glitchColor2 = '#00f0ff',
  fontSize = 64
}) => {
  return (
    <div className={styles.glitchText}>
      <h1
        className={styles.text}
        data-text={text}
        style={
          {
            fontSize,
            '--glitch-color': color,
            '--glitch-c1': glitchColor1,
            '--glitch-c2': glitchColor2
          } as React.CSSProperties
        }
      >
        {text}
      </h1>
    </div>
  );
};

export default GlitchText;
