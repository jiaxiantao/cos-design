import React from 'react';
import styles from './style/index.module.less';

export interface WaveButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** 按钮文字 */
  text?: string;
  /** 主色 */
  color?: string;
}

const WaveButton: React.FC<WaveButtonProps> = ({ text = '点我试试', color = '#38bdf8', className, style, ...rest }) => {
  return (
    <div className={styles.waveButton}>
      <button
        type="button"
        className={`${styles.btn} ${className ?? ''}`}
        style={{ '--wave-color': color, ...style } as React.CSSProperties}
        {...rest}
      >
        <span className={styles.wave} />
        <span className={styles.wave} />
        <span className={styles.label}>{text}</span>
      </button>
    </div>
  );
};

export default WaveButton;
