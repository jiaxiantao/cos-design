import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface CountUpProps {
  /** 目标值 */
  value: number;
  /** 起始值 */
  start?: number;
  /** 动画时长（毫秒） */
  duration?: number;
  /** 小数位数 */
  decimals?: number;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 主色 */
  color?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const formatValue = (value: number, decimals: number) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const CountUp: React.FC<CountUpProps> = ({
  value,
  start = 0,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  color = '#34d399'
}) => {
  const [displayValue, setDisplayValue] = useState(start);
  const frameRef = useRef<number>(0);
  const fromRef = useRef(start);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const begin = performance.now();

    cancelAnimationFrame(frameRef.current);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - begin) / Math.max(duration, 16));
      const eased = easeOutCubic(progress);
      const current = from + (to - from) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [duration, value]);

  const text = useMemo(() => {
    return `${prefix}${formatValue(displayValue, decimals)}${suffix}`;
  }, [decimals, displayValue, prefix, suffix]);

  const stableText = useMemo(() => {
    const candidates = [start, value].map((item) => `${prefix}${formatValue(item, decimals)}${suffix}`);
    return candidates.reduce(
      (longest, current) => (current.length > longest.length ? current : longest),
      candidates[0]
    );
  }, [decimals, prefix, start, suffix, value]);

  return (
    <div className={styles.countUp} style={{ '--count-up-color': color } as React.CSSProperties}>
      <div className={styles.glow} />
      <div className={styles.valueWrap}>
        <span className={`${styles.value} ${styles.measure}`}>{stableText}</span>
        <span className={`${styles.value} ${styles.display}`}>{text}</span>
      </div>
    </div>
  );
};

export default CountUp;
