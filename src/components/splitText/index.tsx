import React, { useEffect, useMemo, useState } from 'react';
import styles from './style/index.module.less';

export interface SplitTextProps {
  /** 显示文字 */
  text?: string;
  /** 动画类型 */
  animation?: 'fadeUp' | 'scale' | 'rotate' | 'blur';
  /** 字符间隔延迟（毫秒） */
  stagger?: number;
  /** 单字符动画时长（毫秒） */
  duration?: number;
  /** 是否循环播放 */
  loop?: boolean;
  /** 循环间歇（毫秒） */
  loopPause?: number;
  /** 字号 */
  fontSize?: number;
  /** 颜色 */
  color?: string;
}

const SplitText: React.FC<SplitTextProps> = ({
  text = 'SPLIT TEXT',
  animation = 'fadeUp',
  stagger = 50,
  duration = 500,
  loop = true,
  loopPause = 2400,
  fontSize = 56,
  color = '#f8fafc'
}) => {
  const [visible, setVisible] = useState(true);
  const chars = useMemo(() => text.split(''), [text]);
  const totalDuration = chars.length * stagger + duration;

  useEffect(() => {
    if (!loop) return;

    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      setVisible(true);
      hideTimer = setTimeout(() => {
        if (cancelled) return;
        setVisible(false);
        showTimer = setTimeout(cycle, Math.max(duration, 600));
      }, totalDuration + loopPause);
    };

    cycle();
    return () => {
      cancelled = true;
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [duration, loop, loopPause, totalDuration]);

  return (
    <div className={styles.splitText}>
      <div
        className={styles.text}
        style={{ fontSize, '--split-color': color, '--split-duration': `${duration}ms` } as React.CSSProperties}
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={`${styles.char} ${styles[animation]} ${visible ? styles.enter : styles.exit}`}
            style={{ animationDelay: `${i * stagger}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SplitText;
