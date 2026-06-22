import React, { useCallback, useRef } from 'react';
import styles from './style/index.module.less';

export interface SpotlightProps {
  children?: React.ReactNode;
  /** 聚光半径，默认 120 */
  radius?: number;
  /** 遮罩颜色，默认 rgba(0,0,0,0.85) */
  dimColor?: string;
}

const Spotlight: React.FC<SpotlightProps> = ({ children, radius = 120, dimColor = 'rgba(0, 0, 0, 0.85)' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--spot-x', `${x}px`);
    el.style.setProperty('--spot-y', `${y}px`);
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.spotlight}
      style={
        {
          '--spot-radius': `${radius}px`,
          '--dim-color': dimColor
        } as React.CSSProperties
      }
      onMouseMove={handleMove}
    >
      <div className={styles.content}>{children}</div>
      <div className={styles.overlay} />
    </div>
  );
};

export default Spotlight;
