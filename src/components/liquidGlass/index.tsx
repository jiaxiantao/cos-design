import React from 'react';
import styles from './style/index.module.less';

export interface LiquidGlassProps {
  children?: React.ReactNode;
  /** 模糊强度，默认 16 */
  blur?: number;
  /** 圆角，默认 20 */
  borderRadius?: number;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({ children = '液态玻璃面板', blur = 16, borderRadius = 20 }) => {
  return (
    <div className={styles.liquidGlass}>
      <div
        className={styles.panel}
        style={
          {
            '--glass-blur': `${blur}px`,
            '--glass-radius': `${borderRadius}px`
          } as React.CSSProperties
        }
      >
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default LiquidGlass;
