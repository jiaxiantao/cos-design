import React from 'react';
import styles from './style/index.module.less';

export interface AuroraProps {
  width?: number;
  height?: number;
  /** 极光色带，默认绿/青/紫 */
  colors?: string[];
}

const DEFAULT_COLORS = ['#00ff87', '#60efff', '#7b2ff7', '#f107a3'];

const Aurora: React.FC<AuroraProps> = ({ width = 800, height = 500, colors = DEFAULT_COLORS }) => {
  const palette = colors.length >= 2 ? colors : DEFAULT_COLORS;

  return (
    <div className={styles.aurora} style={{ width, height }}>
      {palette.map((color, i) => (
        <div
          key={color + i}
          className={styles.band}
          style={
            {
              '--aurora-color': color,
              '--aurora-delay': `${i * -3}s`,
              '--aurora-duration': `${12 + i * 2}s`
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default Aurora;
