import React, { useEffect, useRef } from 'react';
import styles from './style/index.module.less';

export interface ReturnCityProps {
  /** 星星数量，默认按容器宽度自动计算 */
  starCount?: number;
  /** 光壁数量，默认 8 */
  glassCount?: number;
  /** 光壁半径（px），默认 150 */
  glassRadius?: number;
}

const ReturnCity: React.FC<ReturnCityProps> = ({ starCount, glassCount = 8, glassRadius = 150 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glassWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glassWrap = glassWrapRef.current;
    if (!container || !glassWrap) return;

    const timeouts: number[] = [];
    const stars: HTMLDivElement[] = [];
    const glasses: HTMLDivElement[] = [];
    const { width, height } = container.getBoundingClientRect();
    const count = starCount ?? Math.max(20, Math.floor(width / 20));

    for (let index = 0; index < count; index++) {
      const timeout = window.setTimeout(() => {
        const star = document.createElement('div');
        star.className = styles.star;
        star.style.top = `${Math.random() * height}px`;
        star.style.left = `${Math.random() * width}px`;
        container.append(star);
        stars.push(star);
      }, Math.random() * 2000);
      timeouts.push(timeout);
    }

    for (let i = 0; i < glassCount; i++) {
      const glass = document.createElement('div');
      glass.className = styles.glassItem;
      glass.style.transform = `rotateY(${i * (360 / glassCount)}deg) translateZ(${glassRadius}px)`;
      glassWrap.appendChild(glass);
      glasses.push(glass);
      const timeout = window.setTimeout(() => {
        glass.style.top = '0px';
        glass.style.opacity = '1';
      }, i * 300);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      stars.forEach((star) => star.remove());
      glasses.forEach((glass) => glass.remove());
    };
  }, [starCount, glassCount, glassRadius]);

  return (
    <div ref={containerRef} className={styles.returnCityContainer}>
      <div ref={glassWrapRef} className={styles.glassWrap}></div>
    </div>
  );
};

export default ReturnCity;
