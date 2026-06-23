import React, { useEffect, useRef, useState } from 'react';
import { clamp } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface ChargeProps {
  /** 初始电量（非受控），默认 0 */
  initQuantity?: number;
  /** 受控电量 0–100 */
  value?: number;
  /** 电量变化回调 */
  onChange?: (value: number) => void;
  /** 是否自动充电，默认 true */
  autoCharge?: boolean;
  /** 充电间隔（毫秒），默认 500 */
  interval?: number;
  /** 每次增量，默认 0.01 */
  step?: number;
}

const Charge = (props: ChargeProps): React.ReactElement => {
  const { initQuantity = 0, value, onChange, autoCharge = true, interval = 500, step = 0.01 } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [innerQuantity, setInnerQuantity] = useState(() => clamp(initQuantity, 0, 100));
  const quantity = clamp(isControlled ? value : innerQuantity, 0, 100);
  const quantityRef = useRef(quantity);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => {
      el.style.setProperty('--charge-h', `${el.clientHeight}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoCharge) return;

    const timer = window.setInterval(() => {
      if (quantityRef.current >= 100) return;
      const next = Math.min(100, Number((quantityRef.current + step).toFixed(2)));
      if (isControlled) {
        onChangeRef.current?.(next);
      } else {
        setInnerQuantity(next);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoCharge, interval, isControlled, step]);

  const display = quantity.toFixed(2);

  return (
    <div
      ref={containerRef}
      className={styles.chargeContainer}
      style={{ '--charge-pct': quantity } as React.CSSProperties}
    >
      <div className={styles.contrast}>
        <div className={styles.text}>{display}%</div>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <div className={styles.circle} />
        <div className={styles.button} />
      </div>
    </div>
  );
};

export default Charge;
