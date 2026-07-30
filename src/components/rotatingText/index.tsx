import React, { useEffect, useMemo, useState } from 'react';
import styles from './style/index.module.less';

export interface RotatingTextProps {
  /** 轮播文案列表 */
  texts?: string[];
  /** 切换间隔（毫秒） */
  interval?: number;
  /** 字符错峰延迟（毫秒） */
  stagger?: number;
  /** 单字符动画时长（毫秒） */
  duration?: number;
  /** 字号 */
  fontSize?: number;
  /** 颜色 */
  color?: string;
  /** 高亮背景色 */
  highlightColor?: string;
}

const DEFAULT_TEXTS = ['React', 'Motion', 'Design', 'COS'];

const splitChars = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
};

const RotatingText: React.FC<RotatingTextProps> = ({
  texts = DEFAULT_TEXTS,
  interval = 2200,
  stagger = 40,
  duration = 420,
  fontSize = 56,
  color = '#0f172a',
  highlightColor = '#38bdf8'
}) => {
  const safeTexts = useMemo(() => (texts.length > 0 ? texts : DEFAULT_TEXTS), [texts]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  const chars = useMemo(() => splitChars(safeTexts[index]), [index, safeTexts]);

  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      exitTimer = setTimeout(() => {
        setPhase('exit');
        swapTimer = setTimeout(
          () => {
            setIndex((current) => (current + 1) % safeTexts.length);
            setPhase('enter');
          },
          chars.length * stagger + duration
        );
      }, interval);
    };

    cycle();
    return () => {
      if (exitTimer) clearTimeout(exitTimer);
      if (swapTimer) clearTimeout(swapTimer);
    };
  }, [chars.length, duration, index, interval, safeTexts.length, stagger]);

  return (
    <div className={styles.rotatingText}>
      <div
        className={styles.badge}
        style={
          {
            fontSize,
            color,
            '--rt-bg': highlightColor,
            '--rt-duration': `${duration}ms`
          } as React.CSSProperties
        }
      >
        {chars.map((char, i) => (
          <span
            key={`${safeTexts[index]}-${char}-${i}-${phase}`}
            className={`${styles.char} ${phase === 'enter' ? styles.enter : styles.exit}`}
            style={{
              animationDelay: `${phase === 'enter' ? i * stagger : (chars.length - 1 - i) * stagger}ms`
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RotatingText;
