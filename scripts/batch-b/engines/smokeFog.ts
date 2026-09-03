import {
  bindPrefersReducedMotion,
  bindVisibilityPause,
  clamp,
  observeElementSize,
  prefersReducedMotion,
  resolveCanvasBoxSize
} from '@cos-design/shared';
import type { SmokeFogController, SmokeFogOptions } from './types';

const P = 'cos-smoke-fog';
const DEFAULT_W = 800;
const DEFAULT_H = 500;

interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 当前绘制尺寸 */
  size: number;
  /** 出生尺寸 */
  birthSize: number;
  /** 目标扩张尺寸 */
  maxSize: number;
  rotation: number;
  spin: number;
  /** 0~1 生命周期进度 */
  age: number;
  /** 每帧老化速度 */
  ageSpeed: number;
  opacity: number;
  /** 贴图池下标 */
  sprite: number;
  /** 纵向拉伸，上升时更像烟柱 */
  stretch: number;
  /** 对扰动的敏感度 */
  receptivity: number;
  mass: number;
  phase: number;
  /** 色温：偏冷 / 偏暖灰 */
  warmth: number;
}

interface Gust {
  x: number;
  y: number;
  /** 1→0，用于衰减时长 */
  life: number;
  swirl: number;
  /** 当前影响半径（向外扩张） */
  radius: number;
  /** 扩张目标半径 */
  maxRadius: number;
  /** 整体力度 */
  strength: number;
}

interface SmokeConfig {
  speed: number;
  disperseStrength: number;
  disperseRadius: number;
  interactive: boolean;
  color: string;
  backgroundColor: string | [string, string, string];
}

type RGB = [number, number, number];

const SPRITE_POOL = 10;
const SPRITE_SIZE = 128;
const DEFAULT_COLOR = '#d2d4d8';
const DEFAULT_BG: [string, string, string] = ['#14151c', '#1a1b24', '#0e0f14'];

/** 简易值噪声（足够做烟雾边缘破碎感） */
const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const valueNoise = (x: number, y: number) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
};

const fbm = (x: number, y: number) => {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    v += amp * valueNoise(x * freq, y * freq);
    freq *= 2.05;
    amp *= 0.5;
  }
  return v;
};

const parseHex = (hex: string, fallback: RGB): RGB => {
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

const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t)
];

const rgbCss = (rgb: RGB, alpha = 1) =>
  alpha >= 1 ? `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})` : `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${alpha})`;

const resolveBackground = (input: string | [string, string, string]): [string, string, string] => {
  if (Array.isArray(input) && input.length >= 3) {
    return [input[0], input[1], input[2]];
  }
  const base = parseHex(typeof input === 'string' ? input : DEFAULT_BG[2], [14, 15, 20]);
  const mid = mixRgb(base, [255, 255, 255], 0.06);
  const top = mixRgb(base, [255, 255, 255], 0.1);
  return [rgbCss(top), rgbCss(mid), rgbCss(base)];
};

/** 预烘焙不规则烟雾贴图：中心浓、边缘被噪声撕碎 */
const makeSmokeSprite = (seed: number, tint: RGB): HTMLCanvasElement => {
  const cv = document.createElement('canvas');
  cv.width = SPRITE_SIZE;
  cv.height = SPRITE_SIZE;
  const c = cv.getContext('2d')!;
  const img = c.createImageData(SPRITE_SIZE, SPRITE_SIZE);
  const data = img.data;
  const cx = SPRITE_SIZE / 2;
  const cy = SPRITE_SIZE / 2;
  const maxR = SPRITE_SIZE * 0.48;

  for (let y = 0; y < SPRITE_SIZE; y++) {
    for (let x = 0; x < SPRITE_SIZE; x++) {
      const dx = (x - cx) / maxR;
      const dy = (y - cy) / maxR;
      const r = Math.hypot(dx, dy);
      if (r > 1.15) continue;

      const n =
        fbm(x * 0.045 + seed * 17.1, y * 0.045 + seed * 9.3) * 0.7 +
        fbm(x * 0.09 - seed * 3.2, y * 0.09 + seed * 5.7) * 0.3;
      // 噪声扭曲半径，形成丝缕/破洞边缘
      const warped = r + (n - 0.45) * 0.55;
      let density = 1 - Math.max(0, warped);
      density = Math.pow(Math.max(0, density), 1.35);
      density *= 0.55 + n * 0.7;
      if (density < 0.01) continue;

      const i = (y * SPRITE_SIZE + x) * 4;
      // 在用户色上叠加轻微明暗变化（默认 `#d2d4d8` 接近原先灰白烟）
      const variation = 0.88 + n * 0.18;
      data[i] = Math.min(255, tint[0] * variation);
      data[i + 1] = Math.min(255, tint[1] * variation + 1);
      data[i + 2] = Math.min(255, tint[2] * variation + 3);
      data[i + 3] = Math.min(255, density * 210);
    }
  }

  c.putImageData(img, 0, 0);
  return cv;
};

const createSpritePool = (tint: RGB) => Array.from({ length: SPRITE_POOL }, (_, i) => makeSmokeSprite(i + 1, tint));

/**
 * 烟团只从底部出生。
 * progress：0=刚从底冒出，1=已升到接近顶部并变稀（仅用于开场预分布，模拟「已升了一段」）。
 */
const spawnPuff = (width: number, height: number, progress = 0): SmokePuff => {
  const birthSize = 70 + Math.random() * 110;
  const age = Math.min(0.92, progress * 0.88);
  // 从底部往上：progress 越大 y 越小
  const y = height * (1 - progress * 0.92) + birthSize * (0.15 - progress * 0.1);
  // 底部更浓，越高越淡
  const baseOpacity = (0.32 + Math.random() * 0.28) * (1 - progress * 0.55);
  return {
    x: Math.random() * width,
    y,
    vx: (Math.random() - 0.5) * 0.18,
    vy: -(0.08 + Math.random() * 0.16),
    size: birthSize * (0.7 + age * 0.55),
    birthSize,
    maxSize: birthSize * (1.8 + Math.random() * 1.4),
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.004,
    age,
    ageSpeed: 0.0004 + Math.random() * 0.00065,
    opacity: baseOpacity,
    sprite: Math.floor(Math.random() * SPRITE_POOL),
    stretch: 0.85 + Math.random() * 0.55 + progress * 0.25,
    receptivity: 0.5 + Math.random() * 0.85,
    mass: 0.5 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2,
    warmth: Math.random()
  };
};

const clampSpeed = (puff: SmokePuff, maxSpeed: number) => {
  const spd = Math.hypot(puff.vx, puff.vy);
  if (spd <= maxSpeed) return;
  const s = maxSpeed / spd;
  puff.vx *= s;
  puff.vy *= s;
};

/** 生命周期：底部淡入，上升后逐渐淡出变稀 */
const lifeAlpha = (age: number) => {
  if (age < 0.06) return age / 0.06;
  if (age > 0.55) return Math.max(0, 1 - (age - 0.55) / 0.45);
  return 1;
};

/** 高度浓度：底部浓、上方疏（y=0 为顶） */
const heightDensity = (y: number, height: number) => {
  const t = Math.min(1, Math.max(0, y / height));
  // 底部接近满浓，中部仍较厚，顶部变稀但不至于空
  return 0.22 + Math.pow(t, 1.15) * 0.78;
};

export function createSmokeFog(container: HTMLElement, initial: SmokeFogOptions = {}): SmokeFogController {
  let options: SmokeFogOptions = {
    fill: false,
    density: 0.5,
    color: DEFAULT_COLOR,
    backgroundColor: DEFAULT_BG,
    speed: 1,
    disperseStrength: 1,
    disperseRadius: 1,
    interactive: true,
    ...initial
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

  const puffs: SmokePuff[] = [];
  const gusts: Gust[] = [];
  let sprites: HTMLCanvasElement[] | null = null;
  let spriteColor = '';

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
    if (options.interactive !== undefined) canvas.style.cursor = options.interactive ? 'pointer' : 'default';
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
        measured: m
      });
      width = box.width;
      height = box.height;
      applyLayout();
      if (typeof initPuffs === 'function') initPuffs();
      startLoop();
    });
  };

  const initPuffs = () => {
    const count = Math.floor(56 + density * 100);
    puffs = Array.from({ length: count }, () => {
      // 开场按「已从底部升起的进度」预分布，偏底部更密，避免中部突然冒出
      const progress = Math.pow(Math.random(), 1.75);
      return spawnPuff(width, height, progress);
    });
  };

  const startLoop = () => {
    cleanupLoop?.();
    cleanupLoop = null;
    cancelAnimationFrame(frameId);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tint = parseHex(options.color, [210, 212, 216]);
    if (!sprites) {
      sprites = createSpritePool(tint);
      spriteColor = options.color;
    }
    const sprites = sprites;

    let time = 0;

    const paintBackground = () => {
      const [top, mid, bottom] = resolveBackground(options.backgroundColor);
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, top);
      bg.addColorStop(0.45, mid);
      bg.addColorStop(1, bottom);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const base = parseHex(bottom, [14, 15, 20]);
      const glowRgb = mixRgb(base, [255, 255, 255], 0.22);
      // 远处环境光，避免死黑
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.75, 0, width * 0.5, height, width * 0.55);
      glow.addColorStop(0, rgbCss(glowRgb, 0.35));
      glow.addColorStop(1, rgbCss(base, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    };

    const drawPuff = (puff: SmokePuff) => {
      const fade = lifeAlpha(puff.age) * heightDensity(puff.y, height);
      if (fade <= 0.01) return;

      const sprite = sprites[puff.sprite];
      const grow = puff.birthSize + (puff.maxSize - puff.birthSize) * Math.min(1, puff.age * 1.15);
      const size = puff.size + (grow - puff.size) * 0.35;
      const w = size;
      const h = size * puff.stretch;

      ctx.save();
      ctx.translate(puff.x, puff.y);
      ctx.rotate(puff.rotation);
      ctx.globalAlpha = puff.opacity * fade * (0.85 + puff.warmth * 0.2);
      // screen 叠色让烟团交叠处更像体积光，而不是糊成一块
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
      ctx.restore();
    };

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (paused) return;
      if (reduced) return;

      const motion = clamp(options.speed, 0, 3);
      const forceScale = clamp(options.disperseStrength, 0, 3);
      time += 0.01 * Math.max(motion, 0.001);
      paintBackground();

      // 颜色热更新时换贴图池
      if (spriteColor !== options.color) {
        const nextTint = parseHex(options.color, [210, 212, 216]);
        sprites = createSpritePool(nextTint);
        spriteColor = options.color;
      }
      const liveSprites = sprites ?? sprites;

      const puffs = puffs;
      const gusts = gusts;

      for (let g = gusts.length - 1; g >= 0; g--) {
        const gust = gusts[g];
        // 先扩张再衰减：中间最强，首尾柔和
        const spent = 1 - gust.life;
        const envelope = Math.sin(Math.PI * Math.min(1, spent * 1.05)) * gust.strength;
        gust.radius += (gust.maxRadius - gust.radius) * 0.055;

        for (const puff of puffs) {
          const dx = puff.x - gust.x;
          const dy = puff.y - gust.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist > gust.radius) continue;

          const t = dist / gust.radius;
          // 中心软推 + 外缘波前稍强，避免“爆炸式”甩开
          const softCore = Math.exp(-t * t * 2.2) * (1 - t * 0.35);
          const waveFront = Math.exp(-Math.pow((t - 0.72) / 0.32, 2));
          const falloff = softCore * 0.55 + waveFront * 0.45;
          const turbulence = 0.72 + 0.28 * Math.sin(puff.phase * 2.7 + time * 1.2 + dist * 0.03);
          const response = falloff * puff.receptivity * turbulence * envelope;
          if (response < 0.02) continue;

          const nx = dx / dist;
          const ny = dy / dist;
          const tx = -ny * gust.swirl;
          const ty = nx * gust.swirl;
          const inertia = 1 / (0.65 + puff.mass * 0.7);
          const noise = Math.sin(puff.phase * 4.2 + time * 1.6) * 0.35;

          // 轻柔拨开：径向为主，少量旋流与上抬
          puff.vx += (nx * 0.55 + tx * 0.22 + noise * 0.12) * response * inertia;
          puff.vy += (ny * 0.48 + ty * 0.22 - 0.06) * response * inertia;
          // 变薄、略胀开，而不是瞬间消失
          puff.opacity *= 1 - response * 0.028;
          puff.maxSize *= 1 + response * 0.02;
          puff.stretch += response * 0.012;
          puff.spin += noise * response * 0.004;
          clampSpeed(puff, 2.4 * Math.max(forceScale, 0.35));
        }

        gust.life *= 0.972;
        if (gust.life < 0.04) gusts.splice(g, 1);
      }

      ctx.save();
      for (let i = 0; i < puffs.length; i++) {
        const puff = puffs[i];

        // 缓慢漂浮：轻微上浮 + 横向游荡
        const wanderX = Math.sin(time * 0.55 + puff.phase) * 0.16;
        const wanderY = Math.cos(time * 0.4 + puff.phase * 1.3) * 0.05;
        puff.vx += wanderX * 0.018 * motion;
        puff.vy += wanderY * 0.01 * motion - 0.0035 * motion;
        // 被拨开后逐渐减速回落到缓升
        const speedNow = Math.hypot(puff.vx, puff.vy);
        const drag = speedNow > 0.8 ? 0.975 : 0.99;
        puff.vx *= drag;
        puff.vy *= drag;

        puff.x += puff.vx * motion;
        puff.y += puff.vy * motion;
        puff.rotation += (puff.spin + puff.vx * 0.002) * motion;
        puff.age += puff.ageSpeed * motion;
        const grow = puff.birthSize + (puff.maxSize - puff.birthSize) * Math.min(1, puff.age * 1.15);
        puff.size += (grow - puff.size) * 0.04;

        // 上升途中逐渐变淡；被吹散后慢一点回填，避免“啪”一下又聚回来
        const targetOpacity = (0.3 + puff.warmth * 0.1) * heightDensity(puff.y, height);
        const recover = 0.006 + 0.008 * Math.max(0, 1 - speedNow / 2.2);
        puff.opacity += (targetOpacity - puff.opacity) * recover;
        // 越高越拉长、越散开
        puff.stretch += (1.05 + (1 - puff.y / height) * 0.55 - puff.stretch) * 0.01;

        if (puff.age >= 1 || puff.y < -puff.size || puff.opacity < 0.02) {
          // 一律从底部重生，缓慢升上来
          puffs[i] = spawnPuff(width, height, 0);
          continue;
        }

        if (puff.x < -puff.size) puff.x = width + puff.size * 0.5;
        if (puff.x > width + puff.size) puff.x = -puff.size * 0.5;

        const fade = lifeAlpha(puff.age) * heightDensity(puff.y, height);
        if (fade <= 0.01) continue;

        const sprite = liveSprites[puff.sprite];
        const drawGrow = puff.birthSize + (puff.maxSize - puff.birthSize) * Math.min(1, puff.age * 1.15);
        const size = puff.size + (drawGrow - puff.size) * 0.35;
        const w = size;
        const h = size * puff.stretch;

        ctx.save();
        ctx.translate(puff.x, puff.y);
        ctx.rotate(puff.rotation);
        ctx.globalAlpha = puff.opacity * fade * (0.85 + puff.warmth * 0.2);
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      paintBackground();
      for (const puff of puffs) drawPuff(puff);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      return () => {
        unbindVisibility();
        unbindMotion();
      };
    }

    tick();
    return () => {
      cancelAnimationFrame(frameRef.current);
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
    }
  };
}
