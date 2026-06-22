import React from 'react';
import styles from './style/index.module.less';

export interface NewtonCradleProps {
  ballCount?: number;
  color?: string;
}

const NewtonCradle: React.FC<NewtonCradleProps> = ({ ballCount = 5, color = '#38bdf8' }) => {
  const count = Math.max(2, Math.min(ballCount, 7));

  return (
    <div className={styles.newtonCradle} style={{ '--ball-color': color } as React.CSSProperties}>
      <div className={styles.frame}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.pendulum} data-role={i === 0 ? 'left' : i === count - 1 ? 'right' : 'middle'}>
            <span className={styles.string} />
            <span className={styles.ball} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewtonCradle;
