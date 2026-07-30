import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface BlurTextProps {
  /** 显示文字 */
  text?: string;
  /** 按词或按字拆分 */
  animateBy?: 'words' | 'letters';
  /** 入场方向 */
  direction?: 'top' | 'bottom';
  /** 相邻单元延迟（毫秒） */
  stagger?: number;
  /** 单单元动画时长（毫秒） */
  duration?: number;
  /** 字号 */
  fontSize?: number;
  /** 颜色 */
  color?: string;
  /** 动画完成后回调 */
  onAnimationComplete?: () => void;
}

const BlurText: React.FC<BlurTextProps> = ({
  text = 'BLUR TEXT',
  animateBy = 'words',
  direction = 'top',
  stagger = 120,
  duration = 500,
  fontSize = 56,
  color = '#f8fafc',
  onAnimationComplete
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const elements = useMemo(() => (animateBy === 'words' ? text.split(' ') : text.split('')), [animateBy, text]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || doneRef.current || !onAnimationComplete) return;
    const total = elements.length * stagger + duration;
    const timer = window.setTimeout(() => {
      doneRef.current = true;
      onAnimationComplete();
    }, total);
    return () => window.clearTimeout(timer);
  }, [duration, elements.length, inView, onAnimationComplete, stagger]);

  return (
    <div className={styles.blurText} ref={ref}>
      <p
        className={styles.text}
        style={
          {
            fontSize,
            '--blur-color': color,
            '--blur-duration': `${duration}ms`
          } as React.CSSProperties
        }
      >
        {elements.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`${styles.unit} ${styles[direction]} ${inView ? styles.enter : styles.idle}`}
            style={{ animationDelay: `${i * stagger}ms` }}
          >
            {item === ' ' ? '\u00A0' : item}
            {animateBy === 'words' && i < elements.length - 1 ? '\u00A0' : null}
          </span>
        ))}
      </p>
    </div>
  );
};

export default BlurText;
