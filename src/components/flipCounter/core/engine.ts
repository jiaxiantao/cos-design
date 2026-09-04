import type { FlipCounterController, FlipCounterOptions } from './types';

const P = 'cos-flip-counter';
const DEFAULT_AUTO_MS = 2000;

const padDigits = (value: number, digits: number) =>
  Math.max(0, Math.floor(value)).toString().padStart(digits, '0').slice(-digits);

export function createFlipCounter(
  container: HTMLElement,
  initial: FlipCounterOptions = {},
): FlipCounterController {
  let options: FlipCounterOptions = {
    value: 0,
    digits: 4,
    color: '#38bdf8',
    duration: 600,
    auto: false,
    autoInterval: DEFAULT_AUTO_MS,
    ...initial,
  };
  let destroyed = false;
  let liveValue = Math.max(0, Math.floor(options.value ?? 0));
  let autoTimer: number | null = null;
  const digitStates: { prev: string; current: string; flipping: boolean; timer: number }[] = [];

  const root = document.createElement('div');
  root.className = P;
  container.appendChild(root);

  const buildDigitEl = (state: (typeof digitStates)[0]) => {
    const digit = document.createElement('div');
    digit.className = `${P}__digit`;
    digit.style.setProperty('--flip-color', options.color ?? '#38bdf8');
    digit.style.setProperty('--flip-duration', `${options.duration ?? 600}ms`);

    const card = document.createElement('div');
    card.className = `${P}__digit-card`;
    const staticTop = document.createElement('div');
    staticTop.className = `${P}__static-top`;
    const staticBottom = document.createElement('div');
    staticBottom.className = `${P}__static-bottom`;
    const topSpan = document.createElement('span');
    const bottomSpan = document.createElement('span');
    staticTop.appendChild(topSpan);
    staticBottom.appendChild(bottomSpan);
    card.append(staticTop, staticBottom);

    const renderStatic = () => {
      const show = state.flipping ? state.prev : state.current;
      topSpan.textContent = show;
      bottomSpan.textContent = show;
      card.classList.toggle(`${P}__digit-card--flipping`, state.flipping);
    };

    const startFlip = (from: string, to: string) => {
      window.clearTimeout(state.timer);
      state.prev = from;
      state.current = to;
      state.flipping = true;
      renderStatic();
      card.querySelectorAll(`.${P}__flap`).forEach((el) => el.remove());

      const flapTop = document.createElement('div');
      flapTop.className = `${P}__flap ${P}__flap-top`;
      const flapTopSpan = document.createElement('span');
      flapTopSpan.textContent = from;
      flapTop.appendChild(flapTopSpan);

      const flapBottom = document.createElement('div');
      flapBottom.className = `${P}__flap ${P}__flap-bottom`;
      const flapBottomSpan = document.createElement('span');
      flapBottomSpan.textContent = to;
      flapBottom.appendChild(flapBottomSpan);

      card.append(flapTop, flapBottom);
      state.timer = window.setTimeout(() => {
        state.flipping = false;
        flapTop.remove();
        flapBottom.remove();
        renderStatic();
      }, options.duration ?? 600);
    };

    renderStatic();
    digit.appendChild(card);
    return { digit, renderStatic, startFlip };
  };

  let digitEls: ReturnType<typeof buildDigitEl>[] = [];

  const rebuild = (animate: boolean) => {
    root.innerHTML = '';
    digitEls = [];
    const digits = options.digits ?? 4;
    const chars = padDigits(liveValue, digits).split('');
    while (digitStates.length < chars.length)
      digitStates.push({ prev: '0', current: '0', flipping: false, timer: 0 });
    digitStates.length = chars.length;

    chars.forEach((char, i) => {
      const prev = digitStates[i].current;
      if (char !== prev) {
        if (animate) digitStates[i].prev = prev;
        digitStates[i].current = char;
      }
      const built = buildDigitEl(digitStates[i]);
      if (animate && char !== prev) built.startFlip(prev, char);
      root.appendChild(built.digit);
      digitEls.push(built);
    });
  };

  const stopAuto = () => {
    if (autoTimer != null) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const syncAuto = () => {
    if (!(options.auto ?? false) || destroyed) {
      stopAuto();
      return;
    }
    if (autoTimer != null) return;
    const ms = options.autoInterval ?? DEFAULT_AUTO_MS;
    autoTimer = window.setInterval(() => {
      if (destroyed) return;
      liveValue += Math.floor(Math.random() * 9) + 1;
      options.value = liveValue;
      rebuild(true);
    }, ms);
  };

  rebuild(false);
  syncAuto();

  return {
    update(next) {
      const prevValue = options.value;
      const prevDigits = options.digits;
      const prevAuto = Boolean(options.auto);
      const prevInterval = options.autoInterval;
      options = { ...options, ...next };

      if (next.value !== undefined && !options.auto) {
        liveValue = Math.max(0, Math.floor(next.value));
      } else if (next.value !== undefined && options.auto && !prevAuto) {
        liveValue = Math.max(0, Math.floor(next.value));
      } else if (options.auto && !prevAuto) {
        liveValue = Math.max(0, Math.floor(options.value ?? liveValue));
      }

      const valueChanged = next.value !== undefined && next.value !== prevValue && !options.auto;
      const digitsChanged = next.digits !== undefined && next.digits !== prevDigits;
      if (valueChanged || digitsChanged) {
        rebuild(valueChanged);
      } else if (next.color !== undefined || next.duration !== undefined) {
        digitEls.forEach((d) => {
          d.digit.style.setProperty('--flip-color', options.color ?? '#38bdf8');
          d.digit.style.setProperty('--flip-duration', `${options.duration ?? 600}ms`);
        });
      }

      if (Boolean(options.auto) !== prevAuto || options.autoInterval !== prevInterval) {
        stopAuto();
        syncAuto();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopAuto();
      digitStates.forEach((s) => window.clearTimeout(s.timer));
      root.remove();
    },
  };
}
