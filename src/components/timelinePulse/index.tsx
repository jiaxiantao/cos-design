import React from 'react';
import { clamp } from '../_shared/visibility';
import styles from './style/index.module.less';

export interface TimelinePulseProps {
  steps?: string[];
  current?: number;
  color?: string;
}

const TimelinePulse: React.FC<TimelinePulseProps> = ({
  steps = ['Start', 'Process', 'Review', 'Done'],
  current = 0,
  color = '#22d3ee'
}) => {
  const active = clamp(current, 0, Math.max(0, steps.length - 1));
  const progress = steps.length > 1 ? active / (steps.length - 1) : 0;

  return (
    <div
      className={styles.timelinePulse}
      style={
        {
          '--pulse-color': color,
          '--step-count': steps.length,
          '--progress-ratio': progress
        } as React.CSSProperties
      }
    >
      <div className={styles.axis}>
        <div className={styles.track} />
        <div className={styles.progress} />
        <ul className={styles.steps}>
          {steps.map((step, i) => {
            const state = i < active ? 'done' : i === active ? 'current' : 'pending';
            return (
              <li key={step + i} className={styles.step} data-state={state}>
                <span className={styles.dot} />
                <span className={styles.name}>{step}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TimelinePulse;
