import { prefersReducedMotion } from '@cos-design/shared';
import type { SlotMachineController, SlotMachineOptions } from './types';

const P = 'cos-slot-machine';
const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '7️⃣'];
const REEL_COPIES = 30;
const SPIN_CYCLES = 8;
const REEL_STOP_DELAYS = [0, 350, 700];
const ITEM_HEIGHT = 80;
const VISIBLE_COUNT = 3;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const resolveTargetIndex = (symbols: string[], value: string | undefined) => {
  if (value === undefined) return Math.floor(Math.random() * symbols.length);
  const found = symbols.indexOf(value);
  return found >= 0 ? found : Math.floor(Math.random() * symbols.length);
};

export function createSlotMachine(
  container: HTMLElement,
  initial: SlotMachineOptions = {},
): SlotMachineController {
  let options: SlotMachineOptions = {
    symbols: DEFAULT_SYMBOLS,
    spinDuration: 3000,
    spinningText: '旋转中...',
    jackpotText: '🎰 大奖！',
    resultPrefix: '结果:',
    ...initial,
  };
  let destroyed = false;
  let spinning = false;
  let offsets = [0, 0, 0];
  let results: string[] = [];
  let frameId = 0;
  let spinToken: { cancelled: boolean } | null = null;

  const root = document.createElement('div');
  const machine = document.createElement('div');
  machine.className = `${P}__machine`;
  const reels: HTMLDivElement[] = [];
  const strips: HTMLDivElement[] = [];
  for (let i = 0; i < 3; i++) {
    const reel = document.createElement('div');
    reel.className = `${P}__reel`;
    const strip = document.createElement('div');
    strip.className = `${P}__strip`;
    const mask = document.createElement('div');
    mask.className = `${P}__mask`;
    reel.append(strip, mask);
    machine.appendChild(reel);
    reels.push(reel);
    strips.push(strip);
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${P}__spin-btn`;
  button.dataset.testid = 'slot-machine-spin';
  const resultEl = document.createElement('p');
  resultEl.className = `${P}__result`;
  resultEl.hidden = true;
  root.append(machine, button, resultEl);
  container.appendChild(root);

  const symbolsOf = () => (options.symbols?.length ? options.symbols : DEFAULT_SYMBOLS);
  const cycleHeight = () => symbolsOf().length * ITEM_HEIGHT;
  const restBand = () => Math.floor(REEL_COPIES / 2) * cycleHeight();
  const offsetForTarget = (target: number, cycles: number) =>
    -(target - 1 + cycles * symbolsOf().length) * ITEM_HEIGHT;
  const labelOf = () => options.buttonText ?? options.startText ?? '开始';

  const rebuildStrips = () => {
    const list = symbolsOf();
    const extended: string[] = [];
    for (let i = 0; i < REEL_COPIES; i++) extended.push(...list);
    for (const strip of strips) {
      strip.replaceChildren();
      for (const sym of extended) {
        const item = document.createElement('div');
        item.className = `${P}__item`;
        item.style.height = `${ITEM_HEIGHT}px`;
        item.textContent = sym;
        strip.appendChild(item);
      }
    }
    const reelHeight = ITEM_HEIGHT * VISIBLE_COUNT;
    for (const reel of reels) reel.style.height = `${reelHeight}px`;
  };

  const paintOffsets = () => {
    strips.forEach((strip, i) => {
      strip.style.transform = `translateY(${offsets[i]}px)`;
    });
  };

  const renderChrome = () => {
    root.className = P;
    button.disabled = spinning;
    button.setAttribute('aria-busy', String(spinning));
    button.textContent = spinning ? (options.spinningText ?? '旋转中...') : labelOf();
    if (results.length > 0 && !spinning) {
      resultEl.hidden = false;
      resultEl.textContent =
        results[0] === results[1] && results[1] === results[2]
          ? (options.jackpotText ?? '🎰 大奖！')
          : `${options.resultPrefix ?? '结果:'} ${results.join(' ')}`;
    } else {
      resultEl.hidden = true;
      resultEl.textContent = '';
    }
  };

  const spin = (overrideResults?: string[]) => {
    const list = symbolsOf();
    if (spinning || list.length === 0 || destroyed) return;
    spinning = true;
    results = [];
    renderChrome();

    const forced = overrideResults ?? options.targetResults;
    const targets = [0, 1, 2].map((reelIndex) => resolveTargetIndex(list, forced?.[reelIndex]));
    const startOffsets = [...offsets];
    const cycle = list.length * ITEM_HEIGHT;
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

    const duration = Math.max(options.spinDuration ?? 3000, 16);
    const startTime = performance.now();
    const token = { cancelled: false };
    spinToken = token;

    const finishSpin = () => {
      if (token.cancelled || destroyed) return;
      const finalResults = targets.map((t) => list[t]);
      offsets = targets.map((t) => offsetForTarget(t, Math.round(restBand() / cycle)));
      results = finalResults;
      spinning = false;
      paintOffsets();
      renderChrome();
      options.onSpinEnd?.(finalResults);
    };

    if (prefersReducedMotion()) {
      finishSpin();
      return;
    }

    const animateFrame = (now: number) => {
      if (token.cancelled || destroyed) return;
      offsets = startOffsets.map((start, reelIndex) => {
        const elapsed = now - startTime - REEL_STOP_DELAYS[reelIndex];
        if (elapsed < 0) return start;
        const progress = Math.min(elapsed / duration, 1);
        return start + (finalOffsets[reelIndex] - start) * easeOutCubic(progress);
      });
      paintOffsets();
      const allDone = REEL_STOP_DELAYS.every((delay) => now - startTime - delay >= duration);
      if (!allDone) frameId = requestAnimationFrame(animateFrame);
      else finishSpin();
    };
    frameId = requestAnimationFrame(animateFrame);
  };

  const reset = () => {
    if (spinning) return;
    results = [];
    renderChrome();
  };

  button.addEventListener('click', () => spin());
  rebuildStrips();
  paintOffsets();
  renderChrome();

  return {
    update(next) {
      const prevSymbols = symbolsOf().join('\0');
      options = { ...options, ...next };
      if (symbolsOf().join('\0') !== prevSymbols) rebuildStrips();
      renderChrome();
    },
    spin,
    reset,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (spinToken) spinToken.cancelled = true;
      cancelAnimationFrame(frameId);
      root.remove();
    },
  };
}
