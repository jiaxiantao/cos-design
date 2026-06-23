import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface CountdownProps {
  /** 目标时间（Date、时间戳或 ISO 字符串） */
  targetDate: Date | string | number;
  /** 倒计时结束回调 */
  onEnd?: () => void;
  /** 是否显示单位标签，默认 true */
  showLabels?: boolean;
  /** 主色 */
  color?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const parseTarget = (target: Date | string | number) => {
  if (target instanceof Date) return target.getTime();
  if (typeof target === 'number') return target;
  return new Date(target).getTime();
};

const calcTimeLeft = (targetMs: number): TimeLeft => {
  const total = Math.max(0, targetMs - Date.now());
  const seconds = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60
  };
};

const UNITS: { key: keyof Omit<TimeLeft, 'total'>; label: string }[] = [
  { key: 'days', label: '天' },
  { key: 'hours', label: '时' },
  { key: 'minutes', label: '分' },
  { key: 'seconds', label: '秒' }
];

const Countdown: React.FC<CountdownProps> = ({ targetDate, onEnd, showLabels = true, color = '#f472b6' }) => {
  const targetMs = useMemo(() => parseTarget(targetDate), [targetDate]);
  const isValid = !Number.isNaN(targetMs);
  const [, setTick] = useState(0);
  const endedRef = useRef(false);
  const onEndRef = useRef(onEnd);
  const timeLeft = isValid ? calcTimeLeft(targetMs) : { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!isValid) return;
    endedRef.current = false;

    if (Date.now() >= targetMs) {
      endedRef.current = true;
      onEndRef.current?.();
      return;
    }

    const timer = window.setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= targetMs && !endedRef.current) {
        endedRef.current = true;
        onEndRef.current?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isValid, targetMs]);

  if (!isValid) {
    return (
      <div className={styles.countdown}>
        <p className={styles.invalid}>无效的目标时间</p>
      </div>
    );
  }

  return (
    <div className={styles.countdown} style={{ '--countdown-color': color } as React.CSSProperties}>
      {UNITS.map(({ key, label }) => (
        <div key={key} className={styles.unit}>
          <div className={styles.value}>{String(timeLeft[key]).padStart(2, '0')}</div>
          {showLabels && <span className={styles.label}>{label}</span>}
        </div>
      ))}
      {timeLeft.total <= 0 && <p className={styles.ended}>时间到！</p>}
    </div>
  );
};

export default Countdown;
