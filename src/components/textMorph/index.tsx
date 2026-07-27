import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface TextMorphProps {
  /** 轮播文案 */
  texts?: string[];
  /** 切换周期（毫秒） */
  interval?: number;
  /** 单次 morph 时长（毫秒） */
  duration?: number;
  /** 字号 */
  fontSize?: number;
  /** 主色 */
  color?: string;
}

const DEFAULT_TEXTS = ['COS DESIGN', 'TEXT MORPH', 'SMOOTH TRANSITION'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const TextMorph: React.FC<TextMorphProps> = ({
  texts = DEFAULT_TEXTS,
  interval = 2200,
  duration = 680,
  fontSize = 64,
  color = '#f8fafc'
}) => {
  const safeTexts = useMemo(() => (texts.length > 0 ? texts : DEFAULT_TEXTS), [texts]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    const schedule = () => {
      timerRef.current = window.setTimeout(() => {
        const start = performance.now();

        const animate = (now: number) => {
          const ratio = clamp((now - start) / Math.max(duration, 16), 0, 1);
          setProgress(ratio);
          if (ratio < 1) {
            frameRef.current = requestAnimationFrame(animate);
            return;
          }
          setIndex((current) => (current + 1) % safeTexts.length);
          setProgress(0);
        };

        frameRef.current = requestAnimationFrame(animate);
      }, interval);
    };

    schedule();
    return () => {
      window.clearTimeout(timerRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, [duration, index, interval, safeTexts]);

  const current = safeTexts[index];
  const next = safeTexts[(index + 1) % safeTexts.length];
  const currentOpacity = 1 - progress;
  const nextOpacity = progress;
  const currentBlur = progress * 14;
  const nextBlur = (1 - progress) * 14;
  const currentScale = 1 - progress * 0.08;
  const nextScale = 0.92 + progress * 0.08;

  return (
    <div className={styles.textMorph} style={{ '--morph-color': color } as React.CSSProperties}>
      <div className={styles.stage} style={{ fontSize }}>
        <span
          className={`${styles.layer} ${styles.current}`}
          style={{
            opacity: currentOpacity,
            filter: `blur(${currentBlur}px)`,
            transform: `scale(${currentScale}) translateY(${progress * -8}px)`
          }}
        >
          {current}
        </span>
        <span
          className={`${styles.layer} ${styles.next}`}
          style={{
            opacity: nextOpacity,
            filter: `blur(${nextBlur}px)`,
            transform: `scale(${nextScale}) translateY(${(1 - progress) * 8}px)`
          }}
        >
          {next}
        </span>
      </div>
    </div>
  );
};

export default TextMorph;
