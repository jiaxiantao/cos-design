import React from 'react';
import styles from './style/index.module.less';

export interface ShinyTextProps {
  /** 显示文字 */
  text?: string;
  /** 扫光周期（秒） */
  speed?: number;
  /** 文字底色 */
  color?: string;
  /** 高光色 */
  shineColor?: string;
  /** 字号 */
  fontSize?: number;
  /** 是否暂停动画 */
  disabled?: boolean;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text = 'SHINY TEXT',
  speed = 2,
  color = '#94a3b8',
  shineColor = '#ffffff',
  fontSize = 64,
  disabled = false
}) => {
  return (
    <div className={styles.shinyText}>
      <span
        className={`${styles.text} ${disabled ? styles.paused : ''}`}
        style={
          {
            fontSize,
            '--shiny-color': color,
            '--shiny-shine': shineColor,
            '--shiny-duration': `${Math.max(speed, 0.4)}s`
          } as React.CSSProperties
        }
      >
        {text}
      </span>
    </div>
  );
};

export default ShinyText;
