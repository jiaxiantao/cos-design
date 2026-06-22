import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface SlotMachineProps {
  /** 符号列表 */
  symbols?: string[];
  /** 旋转结束回调 */
  onSpinEnd?: (results: string[]) => void;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣'];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const SlotMachine: React.FC<SlotMachineProps> = ({ symbols = DEFAULT_SYMBOLS, onSpinEnd }) => {
  const [spinning, setSpinning] = useState(false);
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [results, setResults] = useState<string[]>([]);
  const frameRefs = useRef<number[]>([0, 0, 0]);

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
    const finalOffsets = targets.map((t) => -(t + symbols.length * 10) * itemHeight);
    const startOffsets = [...offsets];
    const duration = 2000;
    const delays = [0, 300, 600];
    const startTime = performance.now();
    let completed = 0;

    const animate = (reelIndex: number) => {
      const delay = delays[reelIndex];
      const animateFrame = (now: number) => {
        const elapsed = now - startTime - delay;
        if (elapsed < 0) {
          frameRefs.current[reelIndex] = requestAnimationFrame(animateFrame);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = startOffsets[reelIndex] + (finalOffsets[reelIndex] - startOffsets[reelIndex]) * eased;

        setOffsets((prev) => {
          const next = [...prev];
          next[reelIndex] = current;
          return next;
        });

        if (progress < 1) {
          frameRefs.current[reelIndex] = requestAnimationFrame(animateFrame);
        } else {
          completed++;
          if (completed === 3) {
            const finalResults = targets.map((t) => symbols[t]);
            setResults(finalResults);
            setSpinning(false);
            onSpinEnd?.(finalResults);
          }
        }
      };
      frameRefs.current[reelIndex] = requestAnimationFrame(animateFrame);
    };

    [0, 1, 2].forEach(animate);
  };

  useEffect(() => {
    const frames = frameRefs.current;
    return () => {
      frames.forEach((id) => cancelAnimationFrame(id));
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
        {spinning ? '旋转中...' : '开始'}
      </button>
      {results.length > 0 && !spinning && (
        <p className={styles.result}>
          {results[0] === results[1] && results[1] === results[2] ? '🎰 大奖！' : `结果: ${results.join(' ')}`}
        </p>
      )}
    </div>
  );
};

export default SlotMachine;
