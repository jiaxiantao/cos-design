import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize,
} from '@cos-design/shared';
import type { InkBloomController, InkBloomOptions } from './types';

const P = 'cos-ink-bloom';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

const MAX_DPR = 2;

const parseRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (full.length !== 6) return [28, 30, 34];
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [28, 30, 34];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

const valueNoise = (x: number, y: number) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(x0 * 12.9898 + y0 * 78.233);
  const b = hash((x0 + 1) * 12.9898 + y0 * 78.233);
  const c = hash(x0 * 12.9898 + (y0 + 1) * 78.233);
  const d = hash((x0 + 1) * 12.9898 + (y0 + 1) * 78.233);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
};

const fbm = (x: number, y: number) => {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 3; i++) {
    v += a * valueNoise(x * f, y * f);
    f *= 2.05;
    a *= 0.5;
  }
  return v;
};

/**
 * 墨染清水：密度场 + 速度场流体近似。
 * 滴入浓墨靠浮力/涡旋/扩散自然晕开；溶开后质量转入染色场，点击越多背景越深。
 */

export function createInkBloom(
  container: HTMLElement,
  initial: InkBloomOptions = {},
): InkBloomController {
  let options: InkBloomOptions = {
    fill: false,
    inkColor: '#0c0e12',
    speed: 1,
    interactive: true,
    ariaLabel: '墨染清水背景',
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

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  root.appendChild(canvas);
  container.appendChild(root);

  const applyLayout = () => {
    if (options.fill) {
      root.style.width = '100%';
      root.style.height = '100%';
    } else {
      root.style.width = String(width) + 'px';
      root.style.height = String(height) + 'px';
    }
    canvas.style.width = String(width) + 'px';
    canvas.style.height = String(height) + 'px';
    if (options.ariaLabel) {
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', options.ariaLabel);
    }
    if (options.interactive !== undefined)
      canvas.style.cursor = options.interactive ? 'pointer' : 'default';
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      if (typeof initPuffs === 'function') initPuffs();
      startLoop();
      return;
    }
    sizeCleanup = observeElementSize(container, (m) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured: m,
      });
      width = box.width;
      height = box.height;
      applyLayout();
      if (typeof initPuffs === 'function') initPuffs();
      startLoop();
    });
  };

  const startLoop = () => {
    cleanupLoop?.();
    cleanupLoop = null;
    cancelAnimationFrame(frameId);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 更高分辨率，晕边更软
    const simW = Math.max(140, Math.floor(width / 4));
    const simH = Math.max(88, Math.floor(height / 4));
    const N = simW * simH;
    let dens = new Float32Array(N);
    let dens2 = new Float32Array(N);
    // 已溶入水中的染色：点击越多越深，扩散后仍留在背景里
    let stain = new Float32Array(N);
    let stain2 = new Float32Array(N);
    let vx = new Float32Array(N);
    let vy = new Float32Array(N);
    let vx2 = new Float32Array(N);
    let vy2 = new Float32Array(N);
    const curl = new Float32Array(N);

    const sim = document.createElement('canvas');
    sim.width = simW;
    sim.height = simH;
    const simCtx = sim.getContext('2d');
    if (!simCtx) return;
    const image = simCtx.createImageData(simW, simH);

    let localFrameId = 0;
    let lastTs = 0;
    let time = 0;

    const idx = (x: number, y: number) =>
      clamp(Math.floor(x), 0, simW - 1) + clamp(Math.floor(y), 0, simH - 1) * simW;

    const sample = (field: Float32Array, x: number, y: number) => {
      const x0 = clamp(x, 0, simW - 1.001);
      const y0 = clamp(y, 0, simH - 1.001);
      const i = Math.floor(x0);
      const j = Math.floor(y0);
      const fx = x0 - i;
      const fy = y0 - j;
      const i1 = Math.min(i + 1, simW - 1);
      const j1 = Math.min(j + 1, simH - 1);
      const a = field[i + j * simW];
      const b = field[i1 + j * simW];
      const c = field[i + j1 * simW];
      const d = field[i1 + j1 * simW];
      return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
    };

    const toSim = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / Math.max(rect.width, 1)) * simW,
        y: ((clientY - rect.top) / Math.max(rect.height, 1)) * simH,
      };
    };

    /** 在落点附近注入随机涡旋，形成蘑菇云/絮状不稳定 */
    const injectVortex = (cx: number, cy: number, radius: number, strength: number) => {
      const r2 = radius * radius;
      const extent = Math.ceil(radius * 1.4);
      for (let y = -extent; y <= extent; y++) {
        for (let x = -extent; x <= extent; x++) {
          const d2 = x * x + y * y;
          if (d2 < 0.25 || d2 > r2) continue;
          const d = Math.sqrt(d2);
          const w = Math.exp(-d2 / (r2 * 0.55)) * (1 - d / radius);
          const i = idx(cx + x, cy + y);
          // 切向速度
          vx[i] += (-y / d) * strength * w;
          vy[i] += (x / d) * strength * w;
        }
      }
    };

    const injectDrop = (sx: number, sy: number) => {
      const rand = () => Math.random();
      const coreR = 4.2 + rand() * 2.8;
      const amountScale = 1.35 + rand() * 0.55;
      const sink = 1.4 + rand() * 2.4;
      const jitter = 0.5 + rand() * 1.2;

      // 浓墨心：不规则但足够厚，落水瞬间一眼可见
      const extent = Math.ceil(coreR * 3.2);
      for (let y = -extent; y <= extent; y++) {
        for (let x = -extent; x <= extent; x++) {
          const n = (fbm(sx * 0.18 + x * 0.32, sy * 0.18 + y * 0.32) - 0.5) * coreR * 0.85;
          const d = Math.hypot(x, y) + n;
          if (d > coreR * 1.85) continue;
          const fall = Math.exp(-(d * d) / (coreR * coreR * 1.15));
          const i = idx(sx + x, sy + y);
          dens[i] = Math.min(2.4, dens[i] + fall * amountScale);
          vy[i] += fall * sink * 0.4;
          vx[i] += (rand() - 0.5) * fall * jitter;
          vy[i] += (rand() - 0.5) * fall * jitter * 0.45;
        }
      }

      // 3~6 个随机涡旋：拉出自然絮状羽流
      const vortices = 3 + Math.floor(rand() * 4);
      for (let v = 0; v < vortices; v++) {
        const ang = rand() * Math.PI * 2;
        const dist = 2 + rand() * 5.5;
        const cx = sx + Math.cos(ang) * dist;
        const cy = sy + Math.sin(ang) * dist;
        const radius = 4 + rand() * 8;
        const strength = (rand() < 0.5 ? -1 : 1) * (2.2 + rand() * 4.8);
        injectVortex(cx, cy, radius, strength);
      }

      // 外圈淡墨晕：先有可见羽化，再慢慢溶开
      const ring = 6 + rand() * 5;
      for (let a = 0; a < 22; a++) {
        const ang = (a / 22) * Math.PI * 2 + rand() * 0.35;
        const px = sx + Math.cos(ang) * ring * (0.65 + rand() * 0.55);
        const py = sy + Math.sin(ang) * ring * (0.65 + rand() * 0.55);
        const i = idx(px, py);
        dens[i] = Math.min(2.4, dens[i] + 0.18 + rand() * 0.22);
        vx[i] += Math.cos(ang) * (0.35 + rand() * 1.0);
        vy[i] += Math.sin(ang) * (0.35 + rand() * 1.0);
      }
    };

    const injectStir = (sx: number, sy: number, dx: number, dy: number) => {
      const speed = Math.hypot(dx, dy);
      if (speed < 0.04) return;
      const radius = 4.5;
      for (let y = -6; y <= 6; y++) {
        for (let x = -6; x <= 6; x++) {
          const d = Math.hypot(x, y);
          if (d > radius) continue;
          const w = Math.exp(-(d * d) / (radius * radius));
          const i = idx(sx + x, sy + y);
          vx[i] += dx * w * 11;
          vy[i] += dy * w * 11;
          dens[i] = Math.min(1.5, dens[i] + w * 0.015 * speed);
        }
      }
    };

    let prev: { x: number; y: number } | null = null;

    const onDown = (event: PointerEvent) => {
      if (!options.interactive) return;
      const p = toSim(event.clientX, event.clientY);
      prev = p;
      injectDrop(p.x, p.y);
      canvas.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!options.interactive || !event.buttons || !prev) return;
      const p = toSim(event.clientX, event.clientY);
      injectStir(p.x, p.y, p.x - prev.x, p.y - prev.y);
      prev = p;
    };

    const onUp = (event: PointerEvent) => {
      prev = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const advect = (
      src: Float32Array,
      dst: Float32Array,
      u: Float32Array,
      v: Float32Array,
      dt: number,
    ) => {
      for (let y = 0; y < simH; y++) {
        for (let x = 0; x < simW; x++) {
          const i = x + y * simW;
          dst[i] = sample(src, x - u[i] * dt, y - v[i] * dt);
        }
      }
    };

    const diffuseDensity = (src: Float32Array, dst: Float32Array, base: number) => {
      // 稀墨扩散更快、浓心更慢 —— 浓团更久可见
      for (let y = 0; y < simH; y++) {
        for (let x = 0; x < simW; x++) {
          const i = x + y * simW;
          const d0 = src[i];
          const amount = base * (0.28 + (1 - clamp(d0 / 1.6, 0, 1)) * 0.85);
          const l = src[idx(x - 1, y)];
          const r = src[idx(x + 1, y)];
          const u = src[idx(x, y - 1)];
          const dn = src[idx(x, y + 1)];
          dst[i] = d0 * (1 - amount) + (l + r + u + dn) * 0.25 * amount;
        }
      }
    };

    const applyForces = (dt: number) => {
      // 涡度
      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const i = x + y * simW;
          curl[i] = (vy[i + 1] - vy[i - 1]) * 0.5 - (vx[i + simW] - vx[i - simW]) * 0.5;
        }
      }

      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const i = x + y * simW;
          const d = dens[i];
          if (d < 0.002 && Math.abs(curl[i]) < 0.001) continue;

          // 下沉浮力（浓墨略沉）+ 轻微波状侧向
          const g = 4.5 * d;
          vy[i] += g * dt;

          // 涡度约束：拉出絮状细丝
          const cx = (curl[i + 1] - curl[i - 1]) * 0.5;
          const cy = (curl[i + simW] - curl[i - simW]) * 0.5;
          const len = Math.hypot(cx, cy) + 1e-5;
          const eps = 12 * dt;
          vx[i] += (cy / len) * curl[i] * eps;
          vy[i] -= (cx / len) * curl[i] * eps;

          // 时变 curl noise：环境微扰，避免每次同一形态
          const n = fbm(x * 0.07 + time * 0.15, y * 0.07 - time * 0.11);
          const n2 = fbm(x * 0.11 - time * 0.08, y * 0.11 + 40);
          const force = d * 3.2 * dt;
          vx[i] += (n - 0.5) * force * 2;
          vy[i] += (n2 - 0.5) * force * 2;
        }
      }
    };

    const mixHex = (a: string, b: string, t: number) => {
      const [ar, ag, ab] = parseRgb(a);
      const [br, bg, bb] = parseRgb(b);
      const u = clamp(t, 0, 1);
      const r = Math.round(ar + (br - ar) * u);
      const g = Math.round(ag + (bg - ag) * u);
      const bl = Math.round(ab + (bb - ab) * u);
      return `rgb(${r} ${g} ${bl})`;
    };

    const paintWater = (avgStain: number) => {
      // 整体溶墨量把清水逐渐染深（点得越多越深）
      const dye = clamp(1 - Math.exp(-avgStain * 3.2), 0, 0.92);
      const c0 = mixHex('#c5dff0', '#2a3038', dye * 0.85);
      const c1 = mixHex('#9ec9e4', '#232830', dye * 0.9);
      const c2 = mixHex('#7eb0d4', '#1a1e24', dye * 0.95);
      const c3 = mixHex('#5f96bf', '#12151a', dye);

      const water = ctx.createRadialGradient(
        width * 0.5,
        height * 0.38,
        8,
        width * 0.5,
        height * 0.52,
        Math.max(width, height) * 0.78,
      );
      water.addColorStop(0, c0);
      water.addColorStop(0.4, c1);
      water.addColorStop(0.75, c2);
      water.addColorStop(1, c3);
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, width, height);

      const sheenA = Math.max(0, 0.28 * (1 - dye * 1.1));
      if (sheenA > 0.02) {
        const sheen = ctx.createLinearGradient(0, 0, width * 0.35, height);
        sheen.addColorStop(0, `rgb(220 240 255 / ${sheenA * 100}%)`);
        sheen.addColorStop(0.45, 'rgb(180 215 240 / 0%)');
        sheen.addColorStop(1, `rgb(90 140 180 / ${12 * (1 - dye)}%)`);
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, width, height);
      }
    };

    /** 已溶开的墨水：不均匀晕染，最终会慢慢铺匀把水染深 */
    const renderStain = () => {
      const [ir, ig, ib] = parseRgb(options.inkColor);
      const data = image.data;
      for (let i = 0; i < N; i++) {
        const s = stain[i];
        if (s < 0.004) {
          data[i * 4 + 3] = 0;
          continue;
        }
        const optical = 1 - Math.exp(-s * 1.55);
        const o = Math.min(255, optical * 200);
        const dilute = 1 - optical;
        data[i * 4] = Math.round(ir * (1 - dilute * 0.35) + 36 * dilute);
        data[i * 4 + 1] = Math.round(ig * (1 - dilute * 0.3) + 42 * dilute);
        data[i * 4 + 2] = Math.round(ib * (1 - dilute * 0.22) + 58 * dilute);
        data[i * 4 + 3] = o;
      }
      simCtx.putImageData(image, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 0.92;
      ctx.filter = 'blur(2.8px)';
      ctx.drawImage(sim, 0, 0, width, height);
      ctx.globalAlpha = 0.55;
      ctx.filter = 'blur(7px)';
      ctx.drawImage(sim, 0, 0, width, height);
      ctx.restore();
    };

    const renderInk = () => {
      const [ir, ig, ib] = parseRgb(options.inkColor);
      const data = image.data;
      for (let i = 0; i < N; i++) {
        const d = dens[i];
        if (d < 0.003) {
          data[i * 4 + 3] = 0;
          continue;
        }
        const optical = 1 - Math.exp(-d * 2.15);
        const o = Math.min(255, optical * 255);
        const dilute = 1 - optical;
        data[i * 4] = Math.round(ir * (1 - dilute * 0.18) + 28 * dilute);
        data[i * 4 + 1] = Math.round(ig * (1 - dilute * 0.16) + 32 * dilute);
        data[i * 4 + 2] = Math.round(ib * (1 - dilute * 0.12) + 42 * dilute);
        data[i * 4 + 3] = o;
      }
      simCtx.putImageData(image, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      ctx.drawImage(sim, 0, 0, width, height);
      ctx.globalAlpha = 0.38;
      ctx.filter = 'blur(1.6px)';
      ctx.drawImage(sim, 0, 0, width, height);
      ctx.restore();
    };

    if (reduced) {
      paintWater(0);
      return () => {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        unbindVisibility();
        unbindMotion();
      };
    }

    const draw = (ts: number) => {
      localFrameId = requestAnimationFrame(draw);
      if (paused) return;
      if (!lastTs) lastTs = ts;
      const dt = clamp((ts - lastTs) / 1000, 0.008, 0.033);
      lastTs = ts;
      const rate = options.speed;
      const step = dt * rate;
      time += step;

      applyForces(step);

      // 粘滞：速度缓慢衰减，墨团持续漂散数秒
      const damp = Math.exp(-step * 0.55);
      for (let i = 0; i < N; i++) {
        vx[i] *= damp;
        vy[i] *= damp;
      }

      advect(dens, dens2, vx, vy, step * 22);
      [dens, dens2] = [dens2, dens];
      diffuseDensity(dens, dens2, 0.085);
      [dens, dens2] = [dens2, dens];

      advect(vx, vx2, vx, vy, step * 16);
      advect(vy, vy2, vx, vy, step * 16);
      [vx, vx2] = [vx2, vx];
      [vy, vy2] = [vy2, vy];

      // 羽流逐渐溶入「染色场」：质量守恒，背景越点越深
      const dissolve = 1 - Math.exp(-step * 0.022);
      let stainSum = 0;
      for (let i = 0; i < N; i++) {
        const lost = dens[i] * dissolve;
        dens[i] -= lost;
        stain[i] = Math.min(2.8, stain[i] + lost);
        stainSum += stain[i];
      }

      // 染色缓慢铺匀，扩散完成后整片水被染深
      diffuseDensity(stain, stain2, 0.055);
      [stain, stain2] = [stain2, stain];
      // 几乎不褪色（真实墨水染色持久）
      for (let i = 0; i < N; i++) stain[i] *= Math.exp(-step * 0.00035);

      const avgStain = stainSum / N;
      paintWater(avgStain);
      renderStain();
      renderInk();
    };

    draw(0);
    return () => {
      cancelAnimationFrame(localFrameId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
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
  bindSize();

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
