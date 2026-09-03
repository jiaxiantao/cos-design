import { prefersReducedMotion } from '@cos-design/shared';
import type { TurntableController, TurntableOptions, TurntablePrize } from './types';

const P = 'cos-turntable';
const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A78BFA',
  '#60A5FA',
  '#F472B6',
  '#34D399',
  '#FB923C',
];
const DEFAULT_PRIZES: TurntablePrize[] = [
  { label: '一等奖' },
  { label: '二等奖' },
  { label: '三等奖' },
  { label: '谢谢参与' },
  { label: '优惠券' },
  { label: '再来一次' },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const getPrizeColor = (index: number, prize: TurntablePrize) =>
  prize.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];

export function createTurntable(
  container: HTMLElement,
  initial: TurntableOptions = {},
): TurntableController {
  let options: TurntableOptions = {
    prizes: DEFAULT_PRIZES,
    size: 360,
    spinDuration: 4000,
    spinRounds: 5,
    buttonText: '开始抽奖',
    spinningText: '抽奖中...',
    resultPrefix: '恭喜获得：',
    ...initial,
  };
  let destroyed = false;
  let spinning = false;
  let rotation = 0;
  let animationId = 0;
  let spinToken: { cancelled: boolean } | null = null;
  let result: TurntablePrize | null = null;

  const root = document.createElement('div');
  const wheelWrap = document.createElement('div');
  wheelWrap.className = `${P}__wheel-wrap`;
  const pointer = document.createElement('div');
  pointer.className = `${P}__pointer`;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${P}__spin-btn`;
  button.dataset.testid = 'turntable-spin';
  const resultEl = document.createElement('p');
  resultEl.className = `${P}__result`;
  resultEl.hidden = true;
  wheelWrap.append(pointer, canvas, button);
  root.append(wheelWrap, resultEl);
  container.appendChild(root);

  const prizesOf = () => (options.prizes?.length ? options.prizes : DEFAULT_PRIZES);
  const sizeOf = () => options.size ?? 360;
  const canvasSizeOf = () => sizeOf() + 48;

  const drawWheel = (rot: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const list = prizesOf();
    const size = sizeOf();
    const canvasSize = canvasSizeOf();
    const center = canvasSize / 2;
    const radius = size / 2;
    const segmentAngle = (Math.PI * 2) / list.length;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rot);

    list.forEach((prize, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = getPrizeColor(index, prize);
      ctx.fill();
      ctx.strokeStyle = 'rgb(255 255 255 / 35%)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(12, Math.floor(size / 22))}px system-ui, sans-serif`;
      ctx.shadowColor = 'rgb(0 0 0 / 30%)';
      ctx.shadowBlur = 4;
      ctx.fillText(prize.label, radius - 18, 6);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(center, center);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (radius + 14), Math.sin(angle) * (radius + 14), 3, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#fde68a' : '#f59e0b';
      ctx.fill();
    }
    ctx.restore();
  };

  const setupCanvas = () => {
    const canvasSize = canvasSizeOf();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wrapSize = canvasSize;
    wheelWrap.style.width = `${wrapSize}px`;
    wheelWrap.style.height = `${wrapSize}px`;
    root.style.width = `${wrapSize}px`;
    root.style.height = `${wrapSize + 80}px`;
    drawWheel(rotation);
  };

  const renderChrome = () => {
    root.className = P;
    button.disabled = spinning;
    button.setAttribute('aria-busy', String(spinning));
    button.textContent = spinning
      ? (options.spinningText ?? '抽奖中...')
      : (options.buttonText ?? '开始抽奖');
    if (result && !spinning) {
      resultEl.hidden = false;
      resultEl.replaceChildren(document.createTextNode(options.resultPrefix ?? '恭喜获得：'));
      const strong = document.createElement('strong');
      strong.textContent = result.label;
      resultEl.appendChild(strong);
    } else {
      resultEl.hidden = true;
      resultEl.replaceChildren();
    }
  };

  const spin = (overrideIndex?: number) => {
    const list = prizesOf();
    if (spinning || list.length === 0 || destroyed) return;

    spinning = true;
    result = null;
    renderChrome();

    const segmentAngle = (Math.PI * 2) / list.length;
    const rawTarget = overrideIndex ?? options.targetIndex;
    const targetIndex =
      rawTarget === undefined
        ? Math.floor(Math.random() * list.length)
        : ((Math.floor(rawTarget) % list.length) + list.length) % list.length;
    const targetCenter = targetIndex * segmentAngle + segmentAngle / 2;
    const extraRotation = (options.spinRounds ?? 5) * Math.PI * 2;
    const endRotation =
      rotation + extraRotation + (Math.PI * 2 - targetCenter) - (rotation % (Math.PI * 2));
    const startRotation = rotation;
    const startTime = performance.now();
    const token = { cancelled: false };
    spinToken = token;
    const duration = options.spinDuration ?? 4000;

    const finishSpin = (nextRotation: number) => {
      if (token.cancelled || destroyed) return;
      const prize = list[targetIndex];
      rotation = nextRotation;
      drawWheel(nextRotation);
      spinning = false;
      result = prize;
      renderChrome();
      options.onSpinEnd?.(prize, targetIndex);
    };

    if (prefersReducedMotion()) {
      finishSpin(endRotation);
      return;
    }

    const animate = (now: number) => {
      if (token.cancelled || destroyed) return;
      const progress = Math.min((now - startTime) / duration, 1);
      const nextRotation = startRotation + (endRotation - startRotation) * easeOutCubic(progress);
      rotation = nextRotation;
      drawWheel(nextRotation);
      if (progress < 1) animationId = requestAnimationFrame(animate);
      else finishSpin(nextRotation);
    };
    animationId = requestAnimationFrame(animate);
  };

  const reset = () => {
    if (spinning) return;
    result = null;
    renderChrome();
  };

  button.addEventListener('click', () => spin());

  setupCanvas();
  renderChrome();

  return {
    update(next) {
      options = { ...options, ...next };
      setupCanvas();
      renderChrome();
    },
    spin,
    reset,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (spinToken) spinToken.cancelled = true;
      if (animationId) cancelAnimationFrame(animationId);
      root.remove();
    },
  };
}
