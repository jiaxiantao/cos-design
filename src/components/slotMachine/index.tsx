import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface SlotMachineProps {
  /** 符号列表 */
  symbols?: string[];
  /** 单列旋转时长（毫秒），默认 3000；列之间仍有错峰停轮 */
  spinDuration?: number;
  /** 旋转结束回调 */
  onSpinEnd?: (results: string[]) => void;
  /** 开始按钮文案 */
  startText?: string;
  /** 旋转中的按钮文案 */
  spinningText?: string;
  /** 中奖提示 */
  jackpotText?: string;
  /** 普通结果前缀 */
  resultPrefix?: string;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣'];
const REEL_COPIES = 30;
const SPIN_CYCLES = 8;
const REEL_STOP_DELAYS = [0, 350, 700];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const SlotMachine: React.FC<SlotMachineProps> = ({
  symbols = DEFAULT_SYMBOLS,
  spinDuration = 3000,
  onSpinEnd,
  startText = '开始',
  spinningText = '旋转中...',
  jackpotText = '🎰 大奖！',
  resultPrefix = '结果:'
}) => {
  const [spinning, setSpinning] = useState(false);
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [results, setResults] = useState<string[]>([]);
  const frameRef = useRef(0);
  const onSpinEndRef = useRef(onSpinEnd);
  const spinTokenRef = useRef<{ cancelled: boolean } | null>(null);

  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

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

  const offsetForTarget = (target: number, cycles: number) => -(target - 1 + cycles * symbols.length) * itemHeight;

  const handleSpin = () => {
    if (spinning || symbols.length === 0) return;
    setSpinning(true);
    setResults([]);

    const targets = [0, 1, 2].map(() => Math.floor(Math.random() * symbols.length));
    const startOffsets = [...offsets];
    // Always roll at least SPIN_CYCLES full symbol loops from the current position.
    const finalOffsets = targets.map((target, reelIndex) => {
      const start = startOffsets[reelIndex];
      const minTravel = SPIN_CYCLES * cycleHeight;
      let cycles = Math.ceil((-start + minTravel) / cycleHeight) + 1;
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
        const finalResults = targets.map((t) => symbols[t]);
        // Snap to an equivalent mid-strip offset so the next spin still has travel room.
        setOffsets(targets.map((t) => offsetForTarget(t, Math.round(restBand / cycleHeight))));
        setResults(finalResults);
        setSpinning(false);
        onSpinEndRef.current?.(finalResults);
      }
    };

    frameRef.current = requestAnimationFrame(animateFrame);
  };

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
      <button type="button" className={styles.spinBtn} onClick={handleSpin} disabled={spinning}>
        {spinning ? spinningText : startText}
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
};

export default SlotMachine;
