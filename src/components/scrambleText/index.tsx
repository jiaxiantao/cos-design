import React, { useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface ScrambleTextProps {
  /** 目标文字 */
  text?: string;
  /** 解密动画时长（毫秒） */
  duration?: number;
  /** 随机字符集 */
  charset?: string;
}

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

const ScrambleText: React.FC<ScrambleTextProps> = ({
  text = 'DECRYPTED',
  duration = 2000,
  charset = DEFAULT_CHARSET
}) => {
  const [display, setDisplay] = useState('');
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const chars = charset.length > 0 ? charset : DEFAULT_CHARSET;
    const target = text;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const revealed = Math.floor(progress * target.length);

      const next = target
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < revealed) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      setDisplay(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, duration, charset]);

  return (
    <div className={styles.scrambleText}>
      <p className={styles.text}>
        {display}
        <span className={styles.cursor} />
      </p>
    </div>
  );
};

export default ScrambleText;
