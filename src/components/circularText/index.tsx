import React, { useMemo, useState } from 'react';
import styles from './style/index.module.less';

export interface CircularTextProps {
  /** 环绕文字 */
  text?: string;
  /** 一圈旋转时长（秒） */
  spinDuration?: number;
  /** 悬停行为 */
  onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
  /** 字号 */
  fontSize?: number;
  /** 圆环半径（像素） */
  radius?: number;
  /** 文字颜色 */
  color?: string;
}

const CircularText: React.FC<CircularTextProps> = ({
  text = 'COS DESIGN • REACT BITS • ',
  spinDuration = 20,
  onHover = 'speedUp',
  fontSize = 22,
  radius = 90,
  color = '#f8fafc'
}) => {
  const [hovered, setHovered] = useState(false);
  const letters = useMemo(() => Array.from(text), [text]);

  const duration = useMemo(() => {
    if (!hovered) return spinDuration;
    switch (onHover) {
      case 'slowDown':
        return spinDuration * 2;
      case 'speedUp':
        return spinDuration / 4;
      case 'pause':
        return 0;
      case 'goBonkers':
        return Math.max(spinDuration / 20, 0.2);
      default:
        return spinDuration;
    }
  }, [hovered, onHover, spinDuration]);

  const size = radius * 2 + fontSize * 2;

  return (
    <div className={styles.circularText}>
      <div
        className={`${styles.scaleWrap} ${hovered && onHover === 'goBonkers' ? styles.bonkers : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={styles.ring}
          style={
            {
              width: size,
              height: size,
              color,
              fontSize,
              animationDuration: duration > 0 ? `${duration}s` : undefined,
              animationPlayState: duration === 0 ? 'paused' : 'running'
            } as React.CSSProperties
          }
        >
          {letters.map((letter, i) => {
            const rotationDeg = (360 / letters.length) * i;
            return (
              <span
                key={`${letter}-${i}`}
                className={styles.char}
                style={{
                  transform: `rotate(${rotationDeg}deg) translateY(-${radius}px)`
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CircularText;
