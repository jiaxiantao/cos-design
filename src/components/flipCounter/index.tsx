import React, { useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface FlipCounterProps {
  /** 显示数值 */
  value: number;
  /** 最少位数（左侧补零），默认 4 */
  digits?: number;
  /** 主色 */
  color?: string;
  /** 翻牌动画时长（毫秒），默认 600 */
  duration?: number;
}

const padDigits = (value: number, digits: number) => {
  const str = Math.max(0, Math.floor(value)).toString();
  return str.padStart(digits, '0').slice(-digits);
};

interface DigitProps {
  digit: string;
  color: string;
  duration: number;
}

const Digit: React.FC<DigitProps> = ({ digit, color, duration }) => {
  const prevRef = useRef(digit);
  const [flipping, setFlipping] = useState(false);
  const [from, setFrom] = useState(digit);

  useEffect(() => {
    if (digit === prevRef.current) return;
    setFrom(prevRef.current);
    setFlipping(true);
    prevRef.current = digit;
    const timer = window.setTimeout(() => setFlipping(false), duration);
    return () => clearTimeout(timer);
  }, [digit, duration]);

  const staticDigit = flipping ? from : digit;

  return (
    <div
      className={styles.digit}
      style={{ '--flip-color': color, '--flip-duration': `${duration}ms` } as React.CSSProperties}
    >
      <div className={`${styles.digitCard} ${flipping ? styles.isFlipping : ''}`}>
        <div className={styles.staticTop}>
          <span>{staticDigit}</span>
        </div>
        <div className={styles.staticBottom}>
          <span>{staticDigit}</span>
        </div>
        {flipping && (
          <>
            <div className={`${styles.flap} ${styles.flapTop}`}>
              <span>{from}</span>
            </div>
            <div className={`${styles.flap} ${styles.flapBottom}`}>
              <span>{digit}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FlipCounter: React.FC<FlipCounterProps> = ({ value, digits = 4, color = '#38bdf8', duration = 600 }) => {
  const chars = padDigits(value, digits).split('');

  return (
    <div className={styles.flipCounter}>
      {chars.map((char, index) => (
        <Digit key={index} digit={char} color={color} duration={duration} />
      ))}
    </div>
  );
};

export default FlipCounter;
