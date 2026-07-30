import React, { useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface TrueFocusProps {
  /** 句子文案 */
  sentence?: string;
  /** 分词分隔符 */
  separator?: string;
  /** 是否仅 hover 聚焦 */
  manualMode?: boolean;
  /** 非聚焦词模糊强度（px） */
  blurAmount?: number;
  /** 焦点框颜色 */
  borderColor?: string;
  /** 焦点光晕颜色 */
  glowColor?: string;
  /** 切换动画时长（秒） */
  animationDuration?: number;
  /** 自动切换间歇（秒） */
  pauseBetweenAnimations?: number;
  /** 字号 */
  fontSize?: number;
  /** 文字颜色 */
  color?: string;
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor = '#22c55e',
  glowColor = 'rgb(34 197 94 / 60%)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  fontSize = 48,
  color = '#f8fafc'
}) => {
  const words = sentence.split(separator).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (manualMode || words.length === 0) return;
    const interval = window.setInterval(
      () => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      },
      (animationDuration + pauseBetweenAnimations) * 1000
    );
    return () => window.clearInterval(interval);
  }, [animationDuration, manualMode, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    const parent = containerRef.current;
    const active = wordRefs.current[currentIndex];
    if (!parent || !active) return;

    const parentRect = parent.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    });
  }, [currentIndex, fontSize, sentence, words.length]);

  const handleMouseEnter = (index: number) => {
    if (!manualMode) return;
    setLastActiveIndex(index);
    setCurrentIndex(index);
  };

  const handleMouseLeave = () => {
    if (!manualMode) return;
    setCurrentIndex(lastActiveIndex);
  };

  return (
    <div className={styles.trueFocus}>
      <div
        className={styles.stage}
        ref={containerRef}
        style={
          {
            fontSize,
            '--focus-color': color,
            '--border-color': borderColor,
            '--glow-color': glowColor,
            '--focus-duration': `${animationDuration}s`
          } as React.CSSProperties
        }
      >
        {words.map((word, index) => {
          const isActive = index === currentIndex;
          return (
            <span
              key={`${word}-${index}`}
              ref={(el) => {
                wordRefs.current[index] = el;
              }}
              className={styles.word}
              style={{
                filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
                cursor: manualMode ? 'pointer' : 'default'
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {word}
            </span>
          );
        })}
        <div
          className={styles.focusFrame}
          style={{
            transform: `translate(${focusRect.x}px, ${focusRect.y}px)`,
            width: focusRect.width,
            height: focusRect.height,
            opacity: currentIndex >= 0 ? 1 : 0
          }}
        >
          <span className={`${styles.corner} ${styles.tl}`} />
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={`${styles.corner} ${styles.br}`} />
        </div>
      </div>
    </div>
  );
};

export default TrueFocus;
