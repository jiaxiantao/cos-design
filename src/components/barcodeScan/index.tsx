import React from 'react';
import styles from './style/index.module.less';

export interface BarcodeScanProps {
  /** 包裹内容 */
  children?: React.ReactNode;
  /** 扫描线颜色 */
  scanColor?: string;
  /** 扫描速度（秒/次） */
  speed?: number;
}

const BarcodeScan: React.FC<BarcodeScanProps> = ({ children, scanColor = '#22c55e', speed = 2.5 }) => {
  return (
    <div
      className={styles.barcodeScan}
      style={
        {
          '--scan-color': scanColor,
          '--scan-speed': `${speed}s`
        } as React.CSSProperties
      }
    >
      <div className={styles.content}>{children ?? <span className={styles.placeholder}>SCAN ME</span>}</div>
      <div className={styles.overlay}>
        <div className={styles.scanLine} />
        <div className={styles.glitchLayer} />
      </div>
      <div className={styles.corners}>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

export default BarcodeScan;
