import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { prefersReducedMotion } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface NineGridItem {
  /** 奖品文案 */
  label: string;
  /** 可选图标（emoji 等），显示在文案上方 */
  icon?: string;
}

export interface NineGridHandle {
  /** 开始抽奖；可传入目标索引覆盖 props.targetIndex */
  draw: (targetIndex?: number) => void;
  /** 重置高亮与中奖态 */
  reset: () => void;
}

export interface NineGridProps {
  /** 9 个奖品格子（不足补齐、超出截断） */
  items?: NineGridItem[];
  /** 指定下一次抽中的索引 0–8（服务端开奖）；不传则随机 */
  targetIndex?: number;
  /** 抽奖按钮文案 */
  buttonText?: string;
  /** 抽奖进行中的按钮文案 */
  spinningText?: string;
  /** 抽奖结束回调 */
  onDrawEnd?: (item: NineGridItem, index: number) => void;
  /** 禁用交互 */
  disabled?: boolean;
}

const DEFAULT_ITEMS: NineGridItem[] = [
  { icon: '🎁', label: '谢谢参与' },
  { icon: '🧧', label: '红包 1 元' },
  { icon: '🎫', label: '优惠券' },
  { icon: '☕', label: '咖啡券' },
  { icon: '💎', label: '钻石' },
  { icon: '🎧', label: '耳机' },
  { icon: '📦', label: '神秘礼' },
  { icon: '⭐', label: '积分 x10' },
  { icon: '🏆', label: '大奖' }
];

const normalizeItems = (items: NineGridItem[] | undefined): NineGridItem[] => {
  const list = [...(items?.length ? items : DEFAULT_ITEMS)];
  while (list.length < 9) list.push({ label: `奖品 ${list.length + 1}` });
  return list.slice(0, 9);
};

const NineGrid = forwardRef<NineGridHandle, NineGridProps>(
  (
    {
      items = DEFAULT_ITEMS,
      targetIndex,
      buttonText = '开始抽奖',
      spinningText = '抽奖中…',
      onDrawEnd,
      disabled = false
    },
    ref
  ) => {
    const cells = normalizeItems(items);
    const [active, setActive] = useState<number | null>(null);
    const [winner, setWinner] = useState<number | null>(null);
    const [drawing, setDrawing] = useState(false);
    const timersRef = useRef<number[]>([]);
    const onDrawEndRef = useRef(onDrawEnd);
    const targetRef = useRef(targetIndex);

    useEffect(() => {
      onDrawEndRef.current = onDrawEnd;
    }, [onDrawEnd]);

    useEffect(() => {
      targetRef.current = targetIndex;
    }, [targetIndex]);

    const clearTimers = useCallback(() => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    const reset = useCallback(() => {
      clearTimers();
      setDrawing(false);
      setActive(null);
      setWinner(null);
    }, [clearTimers]);

    const draw = useCallback(
      (override?: number) => {
        if (drawing || disabled) return;
        clearTimers();
        setWinner(null);
        setDrawing(true);

        const resolved =
          typeof override === 'number'
            ? override
            : typeof targetRef.current === 'number'
              ? targetRef.current
              : Math.floor(Math.random() * 9);
        const finalIndex = ((resolved % 9) + 9) % 9;

        if (prefersReducedMotion()) {
          setActive(finalIndex);
          setWinner(finalIndex);
          setDrawing(false);
          onDrawEndRef.current?.(cells[finalIndex], finalIndex);
          return;
        }

        const steps = 18 + finalIndex;
        let step = 0;

        const tick = () => {
          const index = step % 9;
          setActive(index);
          step += 1;
          if (step > steps) {
            setActive(finalIndex);
            setWinner(finalIndex);
            setDrawing(false);
            onDrawEndRef.current?.(cells[finalIndex], finalIndex);
            return;
          }
          const delay = 60 + Math.floor(step * 12);
          timersRef.current.push(window.setTimeout(tick, delay));
        };

        tick();
      },
      [cells, clearTimers, disabled, drawing]
    );

    useImperativeHandle(ref, () => ({ draw, reset }), [draw, reset]);

    return (
      <div className={styles.nineGrid}>
        <div className={styles.board} role="grid" aria-label="九宫格抽奖">
          {cells.map((item, index) => {
            const isActive = active === index;
            const isWinner = winner === index;
            return (
              <div
                key={`${item.label}-${index}`}
                role="gridcell"
                className={`${styles.cell} ${isActive ? styles.active : ''} ${isWinner ? styles.winner : ''}`}
              >
                {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
                <span className={styles.label}>{item.label}</span>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className={styles.button}
          data-testid="nine-grid-draw"
          onClick={() => draw()}
          disabled={drawing || disabled}
          aria-busy={drawing}
        >
          {drawing ? spinningText : buttonText}
        </button>
      </div>
    );
  }
);

NineGrid.displayName = 'NineGrid';

export default NineGrid;
