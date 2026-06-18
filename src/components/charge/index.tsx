import React, { useEffect, useRef, useState } from 'react';
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

  const isControlled = value !== undefined;
  const [innerQuantity, setInnerQuantity] = useState(initQuantity);
  const quantity = isControlled ? value : innerQuantity;
  const quantityRef = useRef(quantity);

  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    if (!autoCharge) return;

    const timer = window.setInterval(() => {
      const next = Number((quantityRef.current + step).toFixed(2));
      if (isControlled) {
        onChange?.(next);
      } else {
        setInnerQuantity(next);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoCharge, interval, isControlled, onChange, step]);

  const display = quantity ? quantity.toString().padEnd(4, '0') : '0';

  return (
    <div className={styles.chargeContainer}>
      <div className={styles.contrast}>
        <div className={styles.text}>{display}%</div>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <div className={styles.circle}></div>
        <div className={styles.button}></div>
      </div>
    </div>
  );
};

export default Charge;
