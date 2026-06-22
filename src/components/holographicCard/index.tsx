import React, { useRef } from 'react';
import styles from './style/index.module.less';

export interface HolographicCardProps {
  title?: string;
  subtitle?: string;
  image?: string;
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  title = '全息卡片',
  subtitle = '移动鼠标体验 3D 效果',
  image
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty('--rx', `${-y * 20}deg`);
    card.style.setProperty('--ry', `${x * 20}deg`);
    card.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--gx', '50%');
    card.style.setProperty('--gy', '50%');
  };

  return (
    <div className={styles.wrap}>
      <div ref={cardRef} className={styles.card} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <div className={styles.shine} />
        {image ? (
          <img src={image} alt={title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <span>✦</span>
          </div>
        )}
        <div className={styles.info}>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default HolographicCard;
