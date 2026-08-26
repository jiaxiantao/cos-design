import React from 'react';
import { useCanvasBox } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface AuroraProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 极光色带，默认绿/青/紫 */
  colors?: string[];
}

const DEFAULT_COLORS = ['#00ff87', '#60efff', '#7b2ff7', '#f107a3'];

const Aurora: React.FC<AuroraProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  colors = DEFAULT_COLORS
}) => {
  const { hostRef, hostStyle } = useCanvasBox({
    fill: fillProp,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 500
  });
  const palette = colors.length >= 2 ? colors : DEFAULT_COLORS;

  return (
    <div ref={hostRef} className={styles.aurora} style={hostStyle}>
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
