import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styles from './style/index.module.less';

export interface FlipCardHandle {
  flip: () => void;
  reset: () => void;
}

export interface FlipCardProps {
  /** Front face title (e.g. Day 3) */
  frontTitle?: string;
  /** Front face subtitle */
  frontSubtitle?: string;
  /** Back face reward title */
  backTitle?: string;
  /** Back face detail */
  backSubtitle?: string;
  /** Controlled flip; omit for uncontrolled */
  flipped?: boolean;
  /** Initial flip when uncontrolled */
  defaultFlipped?: boolean;
  /** Called after flip toggles to true (reveal) */
  onReveal?: () => void;
  /** Called on any flip change */
  onFlipChange?: (flipped: boolean) => void;
  /** Disable clicking the card */
  disabled?: boolean;
}

const FlipCard = forwardRef<FlipCardHandle, FlipCardProps>(function FlipCard(
  {
    frontTitle = '签到翻牌',
    frontSubtitle = '点击翻开今日奖励',
    backTitle = '恭喜获得',
    backSubtitle = '积分 +20',
    flipped: flippedProp,
    defaultFlipped = false,
    onReveal,
    onFlipChange,
    disabled = false
  },
  ref
) {
  const [uncontrolled, setUncontrolled] = useState(defaultFlipped);
  const isControlled = typeof flippedProp === 'boolean';
  const flipped = isControlled ? Boolean(flippedProp) : uncontrolled;

  const applyFlip = (next: boolean, fromUserReveal: boolean) => {
    if (!isControlled) setUncontrolled(next);
    onFlipChange?.(next);
    if (next && fromUserReveal) onReveal?.();
  };

  useImperativeHandle(
    ref,
    () => ({
      flip: () => {
        if (disabled || flipped) return;
        applyFlip(true, true);
      },
      reset: () => applyFlip(false, false)
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- imperative API mirrors latest props/state
    [disabled, flipped, isControlled, onFlipChange, onReveal]
  );

  return (
    <button
      type="button"
      className={`${styles.flipCard} ${flipped ? styles.flipped : ''}`}
      onClick={() => {
        if (disabled || flipped) return;
        applyFlip(true, true);
      }}
      disabled={disabled}
      aria-pressed={flipped}
    >
      <span className={styles.inner}>
        <span className={`${styles.face} ${styles.front}`}>
          <span className={styles.kicker}>CHECK-IN</span>
          <span className={styles.title}>{frontTitle}</span>
          <span className={styles.subtitle}>{frontSubtitle}</span>
        </span>
        <span className={`${styles.face} ${styles.back}`}>
          <span className={styles.kicker}>REWARD</span>
          <span className={styles.title}>{backTitle}</span>
          <span className={styles.subtitle}>{backSubtitle}</span>
        </span>
      </span>
    </button>
  );
});

export default FlipCard;
