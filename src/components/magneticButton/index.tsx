import React, { useRef } from 'react';
import styles from './style/index.module.less';

export interface MagneticButtonProps {
  children?: React.ReactNode;
  /** 磁力强度 0–1，默认 0.4 */
  strength?: number;
  /** 按钮颜色 */
  color?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children = '磁吸按钮',
  strength = 0.4,
  color = '#6366f1'
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return;

    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;

    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0, 0)';
  };

  return (
    <div ref={wrapRef} className={styles.magneticButton} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <button ref={btnRef} type="button" className={styles.btn} style={{ '--btn-color': color } as React.CSSProperties}>
        {children}
      </button>
    </div>
  );
};

export default MagneticButton;
