import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  lerp,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { AuroraVeilController, AuroraVeilOptions } from './types';

const P = 'cos-aurora-veil';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

interface Veil {
  x: number;
  width: number;
  amp: number;
  freq: number;
  phase: number;
  drift: number;
  depth: number;
  color: [number, number, number];
  glow: [number, number, number];
  sheets: number;
}

interface Pulse {
  x: number;
  y: number;
  t: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  depth: number;
  warm: boolean;
}

interface PointerState {
  x: number;
  y: number;
  sx: number;
  sy: number;
  vx: number;
  svx: number;
  active: boolean;
}

interface EdgeProfile {
  left: Float32Array;
  right: Float32Array;
}

const DEFAULT_COLORS = ['#7ee8d8', '#4cc9f0', '#9d8df1', '#e8a0f0', '#5eead4'];
const MAX_DPR = 2;
const MAX_PULSES = 4;

const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

const parseRgb = (hex: string, fallback: [number, number, number]): [number, number, number] => {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (full.length !== 6) return fallback;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return fallback;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixRgb = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

const brighten = (c: [number, number, number], amount: number) =>
  mixRgb(c, [255, 255, 255], amount / 255);

const verticalFade = (yNorm: number) => {
  const top = clamp(yNorm / 0.035, 0, 1);
  const bottom = clamp((1 - yNorm) / 0.07, 0, 1);
  return top * bottom;
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function createAuroraVeil(
  container: HTMLElement,
  initial: AuroraVeilOptions = {},
): AuroraVeilController {
  let options: AuroraVeilOptions = {
    fill: false,
    colors: DEFAULT_COLORS,
    bandCount: 5,
    speed: 1,
    interactive: true,
    ariaLabel: '极光帷幕背景',
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
  let cleanupLoop: (() => void) | null = null;

  const veils: Veil[] = [];
  const stars: Star[] = [];
  const pulses: Pulse[] = [];
  let burst = 0;
  let flash = 0;
  const pointer: PointerState = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, svx: 0, active: false };
  let time = 0;

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const syncAria = () => {
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', options.ariaLabel ?? '极光帷幕背景');
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
    syncAria();
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      initScene();
      startLoop();
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
      initScene();
      startLoop();
    });
  };

  const palette = colors.length ? colors : DEFAULT_COLORS;
  const count = Math.max(3, Math.min(8, Math.round(bandCount)));
  veils = Array.from({ length: count }, (_, i) => {
    const color = parseRgb(palette[i % palette.length], [126, 232, 216]);
    return {
      x: width * (0.11 + (i / Math.max(count - 1, 1)) * 0.78),
      width: width * (0.058 + hash(i + 2) * 0.072),
      amp: width * (0.02 + hash(i + 5) * 0.028),
      freq: 0.0038 + hash(i + 8) * 0.0026,
      phase: hash(i + 11) * Math.PI * 2,
      drift: width * (0.012 + hash(i + 13) * 0.022),
      depth: hash(i + 19),
      color,
      glow: brighten(color, 62),
      sheets: 2 + Math.floor(hash(i + 17) * 2),
    };
  });
  veils.sort((a, b) => a.depth - b.depth);

  stars = Array.from({ length: 260 }, (_, i) => {
    const depth = hash(i * 0.91);
    return {
      x: hash(i * 1.71) * width,
      y: hash(i * 3.13 + 2) * height * 0.97,
      r: 0.15 + depth * 1.2,
      a: 0.08 + depth * 0.48,
      tw: hash(i * 6.1),
      depth,
      warm: hash(i * 2.7) > 0.82,
    };
  });
  pulses = [];
  burst = 0;
  flash = 0;
  time = 0;
  const mid = { x: width * 0.5, y: height * 0.5 };
  Object.assign(pointer, {
    x: mid.x,
    y: mid.y,
    sx: mid.x,
    sy: mid.y,
    vx: 0,
    svx: 0,
    active: false,
  });

  const initScene = () => {
    const palette = colors.length ? colors : DEFAULT_COLORS;
    const count = Math.max(3, Math.min(8, Math.round(bandCount)));
    veils = Array.from({ length: count }, (_, i) => {
      const color = parseRgb(palette[i % palette.length], [126, 232, 216]);
      return {
        x: width * (0.11 + (i / Math.max(count - 1, 1)) * 0.78),
        width: width * (0.058 + hash(i + 2) * 0.072),
        amp: width * (0.02 + hash(i + 5) * 0.028),
        freq: 0.0038 + hash(i + 8) * 0.0026,
        phase: hash(i + 11) * Math.PI * 2,
        drift: width * (0.012 + hash(i + 13) * 0.022),
        depth: hash(i + 19),
        color,
        glow: brighten(color, 62),
        sheets: 2 + Math.floor(hash(i + 17) * 2),
      };
    });
    veils.sort((a, b) => a.depth - b.depth);

    stars = Array.from({ length: 260 }, (_, i) => {
      const depth = hash(i * 0.91);
      return {
        x: hash(i * 1.71) * width,
        y: hash(i * 3.13 + 2) * height * 0.97,
        r: 0.15 + depth * 1.2,
        a: 0.08 + depth * 0.48,
        tw: hash(i * 6.1),
        depth,
        warm: hash(i * 2.7) > 0.82,
      };
    });
    pulses = [];
    burst = 0;
    flash = 0;
    time = 0;
    const mid = { x: width * 0.5, y: height * 0.5 };
    Object.assign(pointer, {
      x: mid.x,
      y: mid.y,
      sx: mid.x,
      sy: mid.y,
      vx: 0,
      svx: 0,
      active: false,
    });
  };

  const startLoop = () => {
    cleanupLoop?.();
    cleanupLoop = null;
    cancelAnimationFrame(frameId);
    const canvasEl = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sheet = document.createElement('canvas');
    sheet.width = Math.floor(width * dpr);
    sheet.height = Math.floor(height * dpr);
    const sctx = sheet.getContext('2d');
    if (!sctx) return;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const glowSheet = document.createElement('canvas');
    glowSheet.width = sheet.width;
    glowSheet.height = sheet.height;
    const gctx = glowSheet.getContext('2d');
    if (!gctx) return;
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const steps = Math.max(110, Math.floor(height / 3.5));
    const leftBuf = new Float32Array(steps + 1);
    const rightBuf = new Float32Array(steps + 1);
    const coreLeftBuf = new Float32Array(steps + 1);
    const coreRightBuf = new Float32Array(steps + 1);

    let localFrameId = 0;
    let lastTs = 0;

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (width / Math.max(rect.width, 1)),
        y: (event.clientY - rect.top) * (height / Math.max(rect.height, 1)),
      };
    };

    const setPointer = (x: number, y: number) => {
      const p = pointer;
      pointer.vx = x - pointer.x;
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };

    const onMove = (event: PointerEvent) => {
      if (!options.interactive) return;
      const { x, y } = toLocal(event);
      setPointer(x, y);
    };

    const onEnter = (event: PointerEvent) => {
      if (!options.interactive) return;
      const { x, y } = toLocal(event);
      setPointer(x, y);
    };

    const onDown = (event: PointerEvent) => {
      if (!options.interactive) return;
      const { x, y } = toLocal(event);
      Object.assign(pointer, { x, y, sx: x, sy: y, vx: 0, svx: 0, active: true });
      burst = 1;
      flash = 0.55;
      pulses.push({ x, y, t: 0 });
      if (pulses.length > MAX_PULSES) pulses.shift();
    };

    const onLeave = () => {
      pointer.active = false;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerleave', onLeave);

    const smoothPointer = (dt: number) => {
      const p = pointer;
      const k = 1 - Math.exp(-dt * 16);
      p.sx = lerp(p.sx, p.x, k);
      p.sy = lerp(p.sy, p.y, k);
      p.svx = lerp(p.svx, p.vx, k * 0.88);
      p.vx *= 0.84;
    };

    const flowBias = (time: number) => {
      const p = pointer;
      return p.active ? p.svx * 0.042 : Math.sin(time * 0.1) * 0.26;
    };

    const pointerBoost = (veil: Veil) => {
      if (!pointer.active) return 1;
      const d = Math.abs(pointer.sx - veil.x) / Math.max(width * 0.28, 1);
      return 1 + Math.exp(-d * d * 1.6) * 0.22;
    };

    const centerX = (veil: Veil, y: number, time: number, sheet: number) => {
      const p = pointer;
      const flow = flowBias(time);
      const yNorm = y / Math.max(height, 1);

      const wave =
        Math.sin(y * veil.freq + time * 0.28 + veil.phase + flow * yNorm * 3.8) * veil.amp +
        Math.sin(y * veil.freq * 1.55 + time * 0.17 + veil.phase * 1.15 + flow * yNorm * 2) *
          veil.amp *
          0.42 +
        Math.sin(y * veil.freq * 0.38 + time * 0.11 + sheet * 0.65) * veil.amp * 0.18;

      const drift =
        Math.sin(time * 0.055 + veil.phase + sheet * 0.45) * veil.drift +
        Math.sin(time * 0.032 + veil.phase * 1.6) * veil.drift * 0.34;

      let x = veil.x + wave + drift;

      if (pointer.active) {
        const dy = (y - pointer.sy) / height;
        const magnet = Math.exp(-dy * dy * 2);
        x += (pointer.sx - x) * (0.24 + sheet * 0.04) * magnet;
        x += pointer.svx * 0.28 * magnet * (0.35 + yNorm * 0.65);
      }

      for (const pulse of pulses) {
        const life = easeOut(1 - pulse.t);
        const d = Math.hypot(x - pulse.x, y - pulse.y);
        x += Math.sin(d * 0.04 - pulse.t * 10) * Math.exp(-d / 140) * life * 15;
      }

      if (burst > 0.02) {
        x +=
          Math.sin(y * 0.05 + time * 38 + veil.phase) * burst * 12 +
          Math.sin(y * 0.095 - time * 50 + sheet) * burst * 6;
      }

      return x;
    };

    const halfWidth = (veil: Veil, y: number, time: number, sheet: number) => {
      const p = pointer;
      let hw = veil.width * (0.56 + sheet * 0.12);
      hw *= 0.93 + 0.07 * Math.sin(y * 0.0045 + time * 0.15 + veil.phase + sheet);

      if (pointer.active) {
        const dy = (y - pointer.sy) / height;
        hw *= 1 - 0.38 * Math.exp(-dy * dy * 2.6);
      }

      if (burst > 0.02) {
        hw *= 1 + burst * 0.18 * Math.abs(Math.sin(y * 0.085 + time * 44 + sheet));
      }

      return hw;
    };

    const buildProfile = (veil: Veil, time: number, sheet: number): EdgeProfile => {
      for (let i = 0; i <= steps; i++) {
        const y = (i / steps) * height;
        const cx = centerX(veil, y, time, sheet);
        const hw = halfWidth(veil, y, time, sheet);
        const fold = Math.sin(y * 0.003 + time * 0.1 + veil.phase + sheet * 0.8) * hw * 0.05;
        leftBuf[i] = cx - hw - fold;
        rightBuf[i] = cx + hw + fold * 0.55;
      }
      return { left: leftBuf, right: rightBuf };
    };

    const traceSmoothRibbon = (ctx2d: CanvasRenderingContext2D, profile: EdgeProfile) => {
      ctx2d.beginPath();
      for (let i = 0; i <= steps; i++) {
        const y = (i / steps) * height;
        if (i === 0) ctx2d.moveTo(profile.left[i], y);
        else ctx2d.lineTo(profile.left[i], y);
      }
      for (let i = steps; i >= 0; i--) {
        const y = (i / steps) * height;
        ctx2d.lineTo(profile.right[i], y);
      }
      ctx2d.closePath();
    };

    const fillRibbon = (
      ctx2d: CanvasRenderingContext2D,
      veil: Veil,
      profile: EdgeProfile,
      burst: number,
      coreScale: number,
      alphaScale: number,
      time: number,
    ) => {
      traceSmoothRibbon(ctx2d, profile);
      const [r, g, b] = veil.color;
      const [gr, gg, gb] = veil.glow;
      const boost = pointerBoost(veil);
      const depthFade = 0.62 + veil.depth * 0.38;
      const core = (0.38 + burst * 0.18) * alphaScale * boost * depthFade;
      const edge = 0.1 * alphaScale * depthFade;
      const shimmer = 0.9 + 0.1 * Math.sin(time * 0.65 + veil.phase);

      const horiz = ctx2d.createLinearGradient(
        veil.x - veil.width * 2.4,
        0,
        veil.x + veil.width * 2.4,
        0,
      );
      horiz.addColorStop(0, `rgb(${r} ${g} ${b} / 0%)`);
      horiz.addColorStop(0.34, `rgb(${r} ${g} ${b} / ${edge})`);
      horiz.addColorStop(0.5, `rgb(${gr} ${gg} ${gb} / ${core * coreScale * shimmer})`);
      horiz.addColorStop(0.66, `rgb(${r} ${g} ${b} / ${edge})`);
      horiz.addColorStop(1, `rgb(${r} ${g} ${b} / 0%)`);
      ctx2d.fillStyle = horiz;
      ctx2d.fill();

      const vert = ctx2d.createLinearGradient(0, 0, 0, height);
      vert.addColorStop(0, `rgb(${r} ${g} ${b} / 0%)`);
      vert.addColorStop(0.04, `rgb(${gr} ${gg} ${gb} / ${(0.62 + burst * 0.24) * boost})`);
      vert.addColorStop(0.28, `rgb(${gr} ${gg} ${gb} / ${(0.82 + burst * 0.28) * boost})`);
      vert.addColorStop(0.58, `rgb(${r} ${g} ${b} / ${(0.48 + burst * 0.14) * boost})`);
      vert.addColorStop(0.88, `rgb(${r} ${g} ${b} / 0.05)`);
      vert.addColorStop(1, `rgb(${r} ${g} ${b} / 0%)`);

      ctx2d.save();
      ctx2d.globalCompositeOperation = 'source-atop';
      ctx2d.fillStyle = vert;
      ctx2d.fillRect(0, 0, width, height);
      ctx2d.restore();
    };

    const paintSky = (time: number, staticFrame: boolean) => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#000104');
      sky.addColorStop(0.28, '#020810');
      sky.addColorStop(0.62, '#040c14');
      sky.addColorStop(1, '#020508');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const milky = ctx.createLinearGradient(
        width * 0.1,
        height * 0.05,
        width * 0.9,
        height * 0.35,
      );
      milky.addColorStop(0, 'rgb(0 0 0 / 0%)');
      milky.addColorStop(0.45, 'rgb(50 65 95 / 6%)');
      milky.addColorStop(0.55, 'rgb(60 75 110 / 7%)');
      milky.addColorStop(1, 'rgb(0 0 0 / 0%)');
      ctx.fillStyle = milky;
      ctx.fillRect(0, 0, width, height);

      const nebula = ctx.createRadialGradient(
        width * 0.52,
        height * 0.1,
        0,
        width * 0.48,
        height * 0.22,
        height * 0.7,
      );
      nebula.addColorStop(0, 'rgb(35 55 90 / 8%)');
      nebula.addColorStop(1, 'rgb(0 0 0 / 0%)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const yNorm = star.y / height;
        const tw = staticFrame
          ? 1
          : 0.5 + 0.5 * Math.sin(time * (0.65 + star.depth) + star.tw * 10);
        const alpha = star.a * tw * verticalFade(yNorm);
        if (alpha < 0.02) continue;

        const tint = star.warm ? '255 230 210' : '220 232 255';
        ctx.fillStyle = `rgb(${tint} / ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (star.depth > 0.88) {
          ctx.strokeStyle = `rgb(${tint} / ${alpha * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.r * 3.5, star.y);
          ctx.lineTo(star.x + star.r * 3.5, star.y);
          ctx.moveTo(star.x, star.y - star.r * 3.5);
          ctx.lineTo(star.x, star.y + star.r * 3.5);
          ctx.stroke();
          ctx.fillStyle = `rgb(${tint} / ${alpha * 0.1})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const horizon = ctx.createLinearGradient(0, height * 0.82, 0, height);
      horizon.addColorStop(0, 'rgb(0 0 0 / 0%)');
      horizon.addColorStop(0.55, 'rgb(20 40 55 / 12%)');
      horizon.addColorStop(1, 'rgb(10 25 35 / 28%)');
      ctx.fillStyle = horizon;
      ctx.fillRect(0, height * 0.78, width, height * 0.22);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        height * 0.14,
        width * 0.5,
        height * 0.5,
        height * 0.98,
      );
      vignette.addColorStop(0, 'rgb(0 0 0 / 0%)');
      vignette.addColorStop(1, 'rgb(0 0 0 / 42%)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const paintVeils = (time: number) => {
      const burst = burst;

      sctx.clearRect(0, 0, width, height);
      gctx.clearRect(0, 0, width, height);
      sctx.globalCompositeOperation = 'lighter';
      gctx.globalCompositeOperation = 'lighter';

      for (const veil of veils) {
        for (let sheet = 0; sheet < veil.sheets; sheet++) {
          const profile = buildProfile(veil, time, sheet);
          fillRibbon(sctx, veil, profile, burst, 1, 0.88 / veil.sheets, time);
        }

        const profile = buildProfile(veil, time, 0);
        for (let i = 0; i <= steps; i++) {
          const cx = (profile.left[i] + profile.right[i]) * 0.5;
          coreLeftBuf[i] = lerp(profile.left[i], cx, 0.58);
          coreRightBuf[i] = lerp(profile.right[i], cx, 0.58);
        }
        fillRibbon(gctx, veil, { left: coreLeftBuf, right: coreRightBuf }, burst, 1.35, 0.52, time);
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 1;
      ctx.drawImage(sheet, 0, 0, width, height);
      ctx.globalAlpha = 0.42 + burst * 0.1;
      ctx.filter = 'blur(1px)';
      ctx.drawImage(sheet, 0, 0, width, height);
      ctx.filter = 'none';
      ctx.globalAlpha = 0.62 + burst * 0.12;
      ctx.filter = 'blur(2.4px)';
      ctx.drawImage(glowSheet, 0, 0, width, height);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.restore();

      for (const pulse of pulses) {
        const life = easeOut(1 - pulse.t);
        const radius = 20 + pulse.t * Math.max(width, height) * 0.22;

        const bloom = ctx.createRadialGradient(pulse.x, pulse.y, 0, pulse.x, pulse.y, radius);
        bloom.addColorStop(0, `rgb(140 220 190 / ${0.12 * life})`);
        bloom.addColorStop(0.5, `rgb(80 180 150 / ${0.05 * life})`);
        bloom.addColorStop(1, 'rgb(0 0 0 / 0%)');
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, width, height);
      }

      if (flash > 0.01) {
        ctx.fillStyle = `rgb(180 230 210 / ${flash * 0.06})`;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const paint = (staticFrame: boolean) => {
      paintSky(time, staticFrame);
      paintVeils(time);
    };

    if (reduced) {
      paint(true);
      return () => {
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerenter', onEnter);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointerleave', onLeave);
        unbindVisibility();
        unbindMotion();
      };
    }

    const draw = (ts: number) => {
      localFrameId = requestAnimationFrame(draw);
      if (paused) return;
      if (!lastTs) lastTs = ts;
      const dt = clamp((ts - lastTs) / 1000, 0.008, 0.04);
      lastTs = ts;
      smoothPointer(dt);
      time += dt * options.speed;
      burst *= Math.exp(-dt * 3.2);
      flash *= Math.exp(-dt * 7);
      for (const pulse of pulses) pulse.t += dt * 0.95;
      pulses = pulses.filter((p) => p.t < 1);
      paint(false);
    };

    draw(0);
    return () => {
      cancelAnimationFrame(localFrameId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerleave', onLeave);
      unbindVisibility();
      unbindMotion();
    };
  };

  unbindVisibility = bindVisibilityPause((h) => {
    paused = h;
  });
  unbindMotion = bindPrefersReducedMotion((v) => {
    reduced = v;
    startLoop();
  });

  applyLayout();
  initScene();
  startLoop();

  return {
    update(next) {
      options = { ...options, ...next };
      bindSize();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanupLoop?.();
      cancelAnimationFrame(frameId);
      unbindVisibility?.();
      unbindMotion?.();
      sizeCleanup?.();
      root.remove();
    },
  };
}
