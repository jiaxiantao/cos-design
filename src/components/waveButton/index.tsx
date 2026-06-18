import React from 'react';
import styles from './style/index.module.less';

export interface WaveButtonProps {
  /** 按钮文字 */
  text?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 主色 */
  color?: string;
}

const WaveButton: React.FC<WaveButtonProps> = ({ text = '点我试试', onClick, color = '#38bdf8' }) => {
  return (
    <div className={styles.waveButton}>
      <button
        type="button"
        className={styles.btn}
        style={{ '--wave-color': color } as React.CSSProperties}
        onClick={onClick}
      >
        <span className={styles.wave} />
        <span className={styles.wave} />
        <span className={styles.label}>{text}</span>
      </button>
    </div>
  );
};

export default WaveButton;
