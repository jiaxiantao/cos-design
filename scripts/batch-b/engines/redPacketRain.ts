import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  getRelativePointerPosition,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { RedPacketRainController, RedPacketRainOptions } from './types';

const P = 'cos-red-packet-rain';
const DEFAULT_W = 400;
const DEFAULT_H = 500;

interface Packet {
  id: number;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  amount: number;
  grabbed: boolean;
}

export function createRedPacketRain(
  container: HTMLElement,
  initial: RedPacketRainOptions = {},
): RedPacketRainController {
  let options: RedPacketRainOptions = {
    fill: false,
    duration: 10000,
    auto: true,
    grabbedLabel: '已抢:',
    endedText: '红包雨结束',
    hint: '点击红包抢夺',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let frameId = 0;
  let paused = typeof document !== 'undefined' ? document.hidden : false;
  let reduced = prefersReducedMotion();
  let sizeCleanup: (() => void) | null = null;
  let unbindVisibility: (() => void) | null = null;
  let unbindMotion: (() => void) | null = null;
  const packets: Packet[] = [];
  let idCounter = 0;
  let spawnTimer = 0;
  let endTimer = 0;
  let runId = 0;
  let grabbedTotal = 0;
  let active = options.auto ?? true;
  const onGrabRef = { current: options.onGrab };
  const onEndRef = { current: options.onEnd };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  canvas.style.touchAction = 'none';
  const hud = document.createElement('div');
  hud.className = `${P}__hud`;
  const grabbedSpan = document.createElement('span');
  const endSpan = document.createElement('span');
  endSpan.className = `${P}__end`;
  hud.appendChild(grabbedSpan);
  hud.appendChild(endSpan);
  const hintEl = document.createElement('p');
  hintEl.className = `${P}__hint`;
  root.append(canvas, hud, hintEl);
  container.appendChild(root);

  const syncHud = () => {
    grabbedSpan.textContent = `${options.grabbedLabel ?? '已抢:'} ¥${grabbedTotal}`;
    endSpan.textContent = active ? '' : (options.endedText ?? '红包雨结束');
    endSpan.hidden = active;
    hintEl.textContent = options.hint ?? '点击红包抢夺';
  };

  const applyLayout = () => {
    if (options.fill) {
      root.style.width = '100%';
      root.style.height = '100%';
    } else {
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;
    }
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    syncHud();
  };

  const syncCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      syncCanvas();
      return;
    }
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured,
      });
      width = box.width;
      height = box.height;
      applyLayout();
      syncCanvas();
    });
  };

  const spawnPacket = () => {
    packets.push({
      id: idCounter++,
      x: Math.random() * (width - 50) + 25,
      y: -60,
      speed: Math.random() * 2 + 2,
      rotation: (Math.random() - 0.5) * 0.1,
      amount: [1, 2, 5, 8, 10, 18, 66, 88][Math.floor(Math.random() * 8)],
      grabbed: false,
    });
  };

  const finish = () => {
    if (!active) return;
    active = false;
    syncHud();
    onEndRef.current?.();
  };

  const start = () => {
    runId += 1;
    const currentRun = runId;
    packets.length = 0;
    spawnTimer = 0;
    active = true;
    syncHud();
    window.clearTimeout(endTimer);
    endTimer = window.setTimeout(() => {
      if (currentRun !== runId) return;
      finish();
    }, options.duration ?? 10000);
  };

  const stop = () => {
    window.clearTimeout(endTimer);
    finish();
  };

  const reset = () => {
    window.clearTimeout(endTimer);
    runId += 1;
    packets.length = 0;
    spawnTimer = 0;
    active = false;
    grabbedTotal = 0;
    syncHud();
  };

  const grabAt = (mx: number, my: number) => {
    if (!active) return;
    let grabbedOne = false;
    for (const p of packets) {
      if (p.grabbed || grabbedOne) continue;
      if (Math.abs(mx - p.x) < 30 && Math.abs(my - p.y) < 35) {
        grabbedOne = true;
        p.grabbed = true;
        grabbedTotal += p.amount;
        syncHud();
        onGrabRef.current?.(p.amount);
      }
    }
  };

  const onPointer = (e: PointerEvent) => {
    const pos = getRelativePointerPosition(canvas, e);
    if (pos) grabAt(pos.x, pos.y);
  };

  canvas.addEventListener('pointerdown', onPointer);

  const tick = () => {
    if (destroyed) return;
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!reduced && active) {
      spawnTimer++;
      if (spawnTimer % 20 === 0) spawnPacket();
    }

    ctx.fillStyle = 'rgb(15 23 42 / 20%)';
    ctx.fillRect(0, 0, width, height);

    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      if (p.grabbed) {
        packets.splice(i, 1);
        continue;
      }
      if (!reduced) {
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.02) * 0.5;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-22, -28, 44, 56, 6);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`¥${p.amount}`, 0, 12);
      ctx.restore();
      if (!reduced && p.y >= height + 60) packets.splice(i, 1);
    }
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
  });

  bindSize();
  if (options.auto ?? true) start();
  tick();

  return {
    update(next) {
      options = { ...options, ...next };
      onGrabRef.current = options.onGrab;
      onEndRef.current = options.onEnd;
      bindSize();
      syncHud();
    },
    start,
    stop,
    reset,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.clearTimeout(endTimer);
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      canvas.removeEventListener('pointerdown', onPointer);
      root.remove();
    },
  };
}
