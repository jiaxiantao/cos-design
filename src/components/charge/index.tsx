/*
 * @Description: 充电特效
 * @version: 1.0.0
 * @Author: Xiantao Jia
 * @Date: 2022-04-21 16:42:33
 * @LastEditors: Xiantao Jia
 * @LastEditTime: 2022-04-22 14:14:27
 */

import React, { useEffect, useState } from 'react';
import styles from './style/index.module.less';

export interface ChargeProps {
  initQuantity?: number;
}

const Charge = (props: ChargeProps): JSX.Element => {
  const { initQuantity = 0 } = props;
  const [quantity, setQuantity] = useState(initQuantity);

  useEffect(() => {
    let newQuantity = quantity;
    setInterval(() => {
      newQuantity = Number(Number((newQuantity += 0.01)).toFixed(2));
      setQuantity(newQuantity);
    }, 500);
  }, []);

  return (
    <div className={styles.chargeContainer}>
      <div className={styles.contrast}>
        <div className={styles.text}>{quantity ? quantity.toString().padEnd(4, '0') : 0}%</div>
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
        <span></span>
        <div className={styles.circle}></div>
        <div className={styles.button}></div>
      </div>
    </div>
  );
};
export default Charge;
