import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styles from './style/index.module.less';

export interface FlipCardHandle {
  /** 翻到背面（揭示奖励） */
  flip: () => void;
  /** 翻回正面 */
  reset: () => void;
}

export interface FlipCardProps {
  /** 正面标题 */
  frontTitle?: string;
  /** 正面副标题 */
  frontSubtitle?: string;
  /** 背面奖励标题 */
  backTitle?: string;
  /** 背面奖励说明 */
  backSubtitle?: string;
  /** 受控翻面状态；不传则非受控 */
  flipped?: boolean;
  /** 非受控时的初始翻面状态，默认 false */
  defaultFlipped?: boolean;
  /** 翻到背面时回调 */
  onReveal?: () => void;
  /** 翻面状态变化回调 */
  onFlipChange?: (flipped: boolean) => void;
  /** 禁用点击 */
  disabled?: boolean;
}

const FlipCard = forwardRef<FlipCardHandle, FlipCardProps>(
  (
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
  ) => {
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
  }
);

FlipCard.displayName = 'FlipCard';

export default FlipCard;
