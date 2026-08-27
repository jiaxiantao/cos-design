import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface SlotMachineProps {
  /** 符号列表 */
  symbols?: string[];
  /** 单列旋转时长（毫秒），默认 3000；列之间仍有错峰停轮 */
  spinDuration?: number;
  /** 指定下一次停轮结果（长度 3）；不传则随机 */
  targetResults?: string[];
  /** 旋转结束回调 */
  onSpinEnd?: (results: string[]) => void;
  /** 开始按钮文案 */
  startText?: string;
  /** 开始按钮文案别名（与 Turntable.buttonText 对齐） */
  buttonText?: string;
  /** 旋转中的按钮文案 */
  spinningText?: string;
  /** 中奖提示 */
  jackpotText?: string;
  /** 普通结果前缀 */
  resultPrefix?: string;
}

export interface SlotMachineHandle {
  /** 手动旋转；可传入三列结果覆盖 props.targetResults */
  spin: (results?: string[]) => void;
  /** 清除结果文案 */
  reset: () => void;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣'];
const REEL_COPIES = 30;
const SPIN_CYCLES = 8;
const REEL_STOP_DELAYS = [0, 350, 700];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const resolveTargetIndex = (symbols: string[], value: string | undefined) => {
  if (value === undefined) return Math.floor(Math.random() * symbols.length);
  const found = symbols.indexOf(value);
  return found >= 0 ? found : Math.floor(Math.random() * symbols.length);
};

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>(
  (
    {
      symbols = DEFAULT_SYMBOLS,
      spinDuration = 3000,
      targetResults,
      onSpinEnd,
      startText,
      buttonText,
      spinningText = '旋转中...',
      jackpotText = '🎰 大奖！',
      resultPrefix = '结果:'
    },
    ref
  ) => {
    const label = buttonText ?? startText ?? '开始';
    const [spinning, setSpinning] = useState(false);
    const [offsets, setOffsets] = useState([0, 0, 0]);
    const [results, setResults] = useState<string[]>([]);
    const frameRef = useRef(0);
    const spinningRef = useRef(false);
    const offsetsRef = useRef(offsets);
    const onSpinEndRef = useRef(onSpinEnd);
    const symbolsRef = useRef(symbols);
    const targetResultsRef = useRef(targetResults);
    const spinTokenRef = useRef<{ cancelled: boolean } | null>(null);

    useEffect(() => {
      onSpinEndRef.current = onSpinEnd;
    }, [onSpinEnd]);

    useEffect(() => {
      symbolsRef.current = symbols;
    }, [symbols]);

    useEffect(() => {
      targetResultsRef.current = targetResults;
    }, [targetResults]);

    useEffect(() => {
      spinningRef.current = spinning;
    }, [spinning]);

    useEffect(() => {
      offsetsRef.current = offsets;
    }, [offsets]);

    const itemHeight = 80;
    const visibleCount = 3;
    const reelHeight = itemHeight * visibleCount;
    const cycleHeight = symbols.length * itemHeight;
    // Keep resting offsets near the middle of the strip so every spin has room to travel.
    const restBand = Math.floor(REEL_COPIES / 2) * cycleHeight;

    const extendedSymbols = useCallback(() => {
      const repeated: string[] = [];
      for (let i = 0; i < REEL_COPIES; i++) repeated.push(...symbols);
      return repeated;
    }, [symbols]);

    const extended = extendedSymbols();

    const offsetForTarget = (target: number, cycles: number) =>
      -(target - 1 + cycles * symbolsRef.current.length) * itemHeight;

    const spin = useCallback(
      (overrideResults?: string[]) => {
        const list = symbolsRef.current;
        if (spinningRef.current || list.length === 0) return;
        setSpinning(true);
        setResults([]);

        const forced = overrideResults ?? targetResultsRef.current;
        const targets = [0, 1, 2].map((reelIndex) => resolveTargetIndex(list, forced?.[reelIndex]));
        const startOffsets = [...offsetsRef.current];
        const cycle = list.length * itemHeight;
        // Always roll at least SPIN_CYCLES full symbol loops from the current position.
        const finalOffsets = targets.map((target, reelIndex) => {
          const start = startOffsets[reelIndex];
          const minTravel = SPIN_CYCLES * cycle;
          let cycles = Math.ceil((-start + minTravel) / cycle) + 1;
          let end = offsetForTarget(target, cycles);
          while (start - end < minTravel) {
            cycles += 1;
            end = offsetForTarget(target, cycles);
          }
          return end;
        });

        const duration = Math.max(spinDuration, 16);
        const startTime = performance.now();
        const token = { cancelled: false };
        spinTokenRef.current = token;

        const animateFrame = (now: number) => {
          if (token.cancelled) return;

          const next = startOffsets.map((start, reelIndex) => {
            const elapsed = now - startTime - REEL_STOP_DELAYS[reelIndex];
            if (elapsed < 0) return start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            return start + (finalOffsets[reelIndex] - start) * eased;
          });

          setOffsets(next);

          const allDone = REEL_STOP_DELAYS.every((delay) => now - startTime - delay >= duration);

          if (!allDone) {
            frameRef.current = requestAnimationFrame(animateFrame);
          } else if (!token.cancelled) {
            const finalResults = targets.map((t) => list[t]);
            // Snap to an equivalent mid-strip offset so the next spin still has travel room.
            setOffsets(targets.map((t) => offsetForTarget(t, Math.round(restBand / cycle))));
            setResults(finalResults);
            setSpinning(false);
            onSpinEndRef.current?.(finalResults);
          }
        };

        frameRef.current = requestAnimationFrame(animateFrame);
      },
      [restBand, spinDuration]
    );

    const reset = useCallback(() => {
      if (spinningRef.current) return;
      setResults([]);
    }, []);

    useImperativeHandle(ref, () => ({ spin, reset }), [spin, reset]);

    useEffect(() => {
      return () => {
        if (spinTokenRef.current) spinTokenRef.current.cancelled = true;
        cancelAnimationFrame(frameRef.current);
      };
    }, []);

    return (
      <div className={styles.slotMachine}>
        <div className={styles.machine}>
          {[0, 1, 2].map((reel) => (
            <div key={reel} className={styles.reel} style={{ height: reelHeight }}>
              <div className={styles.strip} style={{ transform: `translateY(${offsets[reel]}px)` }}>
                {extended.map((sym, i) => (
                  <div key={i} className={styles.item} style={{ height: itemHeight }}>
                    {sym}
                  </div>
                ))}
              </div>
              <div className={styles.mask} />
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.spinBtn}
          data-testid="slot-machine-spin"
          onClick={() => spin()}
          disabled={spinning}
          aria-busy={spinning}
        >
          {spinning ? spinningText : label}
        </button>
        {results.length > 0 && !spinning && (
          <p className={styles.result}>
            {results[0] === results[1] && results[1] === results[2]
              ? jackpotText
              : `${resultPrefix} ${results.join(' ')}`}
          </p>
        )}
      </div>
    );
  }
);

SlotMachine.displayName = 'SlotMachine';

export default SlotMachine;
