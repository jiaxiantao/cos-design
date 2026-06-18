/*
 * @Description: 回城特效
 * @version: 1.0.0
 * @Author: Xiantao Jia
 * @Date: 2022-04-22 14:12:37
 * @LastEditors: Xiantao Jia
 * @LastEditTime: 2022-04-22 17:03:17
 */

import React, { useEffect } from 'react';
import styles from './style/index.module.less';

export interface ReturnCityProps {
  shining?: number;
}

const ReturnCity: React.FC<ReturnCityProps> = () => {
  // 添加星星

  const addStar = (wrap: Element, length: number) => {
    for (let index = 0; index < length; index++) {
      setTimeout(function () {
        const star = document.createElement('div');
        star.className = styles.star;
        const width = document.body.clientWidth;
        const height = document.body.clientHeight;
        const left = Math.random() * width + 'px';
        const top = Math.random() * height + 'px';
        star.style.top = top;
        star.style.left = left;
        wrap.append(star);
        // setInterval(() => {
        //   const left = Math.random() * width + 'px';
        //   const top = Math.random() * height + 'px';
        //   star.style.top = top;
        //   star.style.left = left;
        // }, 2000);
      }, Math.random() * 2000);
    }
  };
  // 添加光壁
  const creatGlass = () => {
    // 光壁
    const glassNum = 6;
    const glassRadius = '150px'; // 半径
    const glassWrap = document.getElementById('glassWrap');
    if (!glassWrap) {
      return;
    }

    // 生成光壁
    for (let i = 0; i < glassNum; i++) {
      const glass = document.createElement('div');
      glass.className = styles.glassItem;
      glass.style.transform = `rotateY(${i * (360 / glassNum)}deg) translateZ(${glassRadius})`;
      glassWrap.appendChild(glass);
      setTimeout(() => {
        glass.style.top = '0px';
        glass.style.opacity = '1';
      }, i * 300);
    }
  };

  useEffect(() => {
    const container = document.getElementById('returnCityContainer');
    if (container) {
      addStar(container, document.documentElement.clientWidth / 20);
    }
    creatGlass();
  }, []);

  return (
    <div id="returnCityContainer" className={styles.returnCityContainer}>
      <div id="glassWrap" className={styles.glassWrap}></div>
    </div>
  );
};
export default ReturnCity;
