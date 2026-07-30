import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface SlotMachineProps {
  /** 符号列表 */
  symbols?: string[];
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

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const SlotMachine: React.FC<SlotMachineProps> = ({
  symbols = DEFAULT_SYMBOLS,
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

  const extendedSymbols = useCallback(() => {
    const repeated: string[] = [];
    for (let i = 0; i < 20; i++) repeated.push(...symbols);
    return repeated;
  }, [symbols]);

  const extended = extendedSymbols();

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResults([]);

    const targets = [0, 1, 2].map(() => Math.floor(Math.random() * symbols.length));
    // 中间行（第 2 行）为开奖线：offset 使 symbols[t] 落在正中
    const finalOffsets = targets.map((t) => -(t - 1 + symbols.length * 10) * itemHeight);
    const startOffsets = [...offsets];
    const duration = 2000;
    const delays = [0, 300, 600];
    const startTime = performance.now();
    const token = { cancelled: false };
    spinTokenRef.current = token;

    const animateFrame = (now: number) => {
      if (token.cancelled) return;

      const next = startOffsets.map((start, reelIndex) => {
        const elapsed = now - startTime - delays[reelIndex];
        if (elapsed < 0) return start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        return start + (finalOffsets[reelIndex] - start) * eased;
      });

      setOffsets(next);

      const allDone = delays.every((delay) => now - startTime - delay >= duration);

      if (!allDone) {
        frameRef.current = requestAnimationFrame(animateFrame);
      } else if (!token.cancelled) {
        const finalResults = targets.map((t) => symbols[t]);
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
