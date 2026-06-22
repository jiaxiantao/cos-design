import React, { useEffect, useRef } from 'react';
import { clamp } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface ProgressChestProps {
  /** 进度 0–100 */
  progress?: number;
  /** 宝箱打开回调 */
  onOpen?: () => void;
  /** 标签文字 */
  label?: string;
}

const ProgressChest: React.FC<ProgressChestProps> = ({ progress = 0, onOpen, label = '开启宝箱' }) => {
  const openedRef = useRef(false);
  const pct = clamp(progress, 0, 100);
  const isOpen = pct >= 100;

  useEffect(() => {
    if (isOpen && !openedRef.current) {
      openedRef.current = true;
      onOpen?.();
    }
    if (!isOpen) {
      openedRef.current = false;
    }
  }, [isOpen, onOpen]);

  return (
    <div className={styles.progressChest}>
      <div className={styles.barWrap}>
        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.pct}>{pct.toFixed(0)}%</span>
      </div>

      <div className={`${styles.chest} ${isOpen ? styles.open : ''}`}>
        <div className={styles.lid}>
          <div className={styles.lidTop} />
          <div className={styles.lock} />
        </div>
        <div className={styles.body}>
          {isOpen && (
            <div className={styles.treasure}>
              <span>💎</span>
              <span>✨</span>
              <span>🪙</span>
            </div>
          )}
        </div>
      </div>

      <p className={styles.label}>{isOpen ? '宝箱已开启！' : label}</p>
    </div>
  );
};

export default ProgressChest;
