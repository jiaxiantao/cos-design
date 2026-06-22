import React from 'react';
import styles from './style/index.module.less';

export interface GradientFlowProps {
  /** 显示文字 */
  text?: string;
  /** 渐变色列表 */
  colors?: string[];
  /** 字号 */
  fontSize?: number;
}

const DEFAULT_COLORS = ['#ff00de', '#7c3aed', '#00f0ff', '#38bdf8', '#ff00de'];

const GradientFlow: React.FC<GradientFlowProps> = ({ text = 'GRADIENT', colors = DEFAULT_COLORS, fontSize = 64 }) => {
  const gradient = colors.length >= 2 ? colors.join(', ') : DEFAULT_COLORS.join(', ');

  return (
    <div className={styles.gradientFlow}>
      <h1
        className={styles.text}
        style={
          {
            fontSize,
            backgroundImage: `linear-gradient(90deg, ${gradient})`
          } as React.CSSProperties
        }
      >
        {text}
      </h1>
    </div>
  );
};

export default GradientFlow;
