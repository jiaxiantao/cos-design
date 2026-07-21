import React, { useEffect, useRef } from 'react';
import { bindVisibilityPause } from '../_shared/visibility';
import styles from './style/index.module.less';

export type WeatherType =
  | 'sunny'
  | 'partlyCloudy'
  | 'overcast'
  | 'lightRain'
  | 'moderateRain'
  | 'heavyRain'
  | 'thunderstorm'
  | 'fog'
  | 'lightSnow'
  | 'moderateSnow'
  | 'heavySnow'
  | 'sleet'
  | 'hail'
  | 'smog'
  | 'gale'
  /** @deprecated 请使用 moderateSnow */
  | 'snow';

export interface WeatherBackgroundProps {
  width?: number;
  height?: number;
  /** 天气类型：sunny 大晴天 / partlyCloudy 多云 / overcast 阴天 / lightRain 小雨 / moderateRain 中雨 / heavyRain 大雨 / thunderstorm 雷阵雨 / fog 雾 / lightSnow 小雪 / moderateSnow 中雪 / heavySnow 大雪 / sleet 雨夹雪 / hail 冰雹 / smog 霾 / gale 大风 */
  weather?: WeatherType;
}

interface WeatherConfig {
  sky: [string, string];
  sun: 'full' | 'soft' | 'dim' | 'none';
  cloudCount: number;
  cloudColor: [number, number, number];
  cloudAlpha: number;
  cloudSpread: number;
  rain: { count: number; speed: number; wind: number; alpha: number; splash: boolean } | null;
  fogBanks: number;
  haze: number;
  snowCount: number;
  lightning: boolean;
}

const CONFIGS: Record<WeatherType, WeatherConfig> = {
  sunny: {
    sky: ['#4a9fe0', '#c8e8fb'],
    sun: 'full',
    cloudCount: 1,
    cloudColor: [255, 255, 255],
    cloudAlpha: 0.5,
    cloudSpread: 0.12,
    rain: null,
    fogBanks: 0,
    haze: 0,
    snowCount: 0,
    lightning: false
  },
  partlyCloudy: {
    sky: ['#5b9bd0', '#cfe6f3'],
    sun: 'soft',
    cloudCount: 5,
    cloudColor: [255, 255, 255],
    cloudAlpha: 0.85,
    cloudSpread: 0.22,
    rain: null,
    fogBanks: 0,
    haze: 0,
    snowCount: 0,
    lightning: false
  },
  overcast: {
    sky: ['#8a97a8', '#c3cbd6'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [100, 116, 139],
    cloudAlpha: 0.55,
    cloudSpread: 0.3,
    rain: null,
    fogBanks: 0,
    haze: 0.06,
    snowCount: 0,
    lightning: false
  },
  lightRain: {
    sky: ['#6b7a8f', '#9aa7b8'],
    sun: 'none',
    cloudCount: 7,
    cloudColor: [71, 85, 105],
    cloudAlpha: 0.6,
    cloudSpread: 0.24,
    rain: { count: 70, speed: 7, wind: -0.8, alpha: 0.4, splash: false },
    fogBanks: 0,
    haze: 0.04,
    snowCount: 0,
    lightning: false
  },
  moderateRain: {
    sky: ['#55637a', '#7e8ba0'],
    sun: 'none',
    cloudCount: 8,
    cloudColor: [51, 65, 85],
    cloudAlpha: 0.65,
    cloudSpread: 0.26,
    rain: { count: 150, speed: 10, wind: -1.5, alpha: 0.5, splash: true },
    fogBanks: 0,
    haze: 0.06,
    snowCount: 0,
    lightning: false
  },
  heavyRain: {
    sky: ['#3d4a5f', '#5d6a80'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [30, 41, 59],
    cloudAlpha: 0.7,
    cloudSpread: 0.3,
    rain: { count: 280, speed: 14, wind: -2.8, alpha: 0.55, splash: true },
    fogBanks: 0,
    haze: 0.1,
    snowCount: 0,
    lightning: false
  },
  thunderstorm: {
    sky: ['#252f42', '#43506a'],
    sun: 'none',
    cloudCount: 10,
    cloudColor: [15, 23, 42],
    cloudAlpha: 0.75,
    cloudSpread: 0.32,
    rain: { count: 240, speed: 13, wind: -2.2, alpha: 0.55, splash: true },
    fogBanks: 0,
    haze: 0.08,
    snowCount: 0,
    lightning: true
  },
  fog: {
    sky: ['#aab4bf', '#d5dbe1'],
    sun: 'dim',
    cloudCount: 3,
    cloudColor: [203, 213, 225],
    cloudAlpha: 0.4,
    cloudSpread: 0.2,
    rain: null,
    fogBanks: 10,
    haze: 0.28,
    snowCount: 0,
    lightning: false
  },
  lightSnow: {
    sky: ['#aab8c8', '#e2e8ef'],
    sun: 'none',
    cloudCount: 5,
    cloudColor: [166, 180, 196],
    cloudAlpha: 0.45,
    cloudSpread: 0.22,
    rain: null,
    fogBanks: 0,
    haze: 0.05,
    snowCount: 70,
    lightning: false
  },
  moderateSnow: {
    sky: ['#9fb0c4', '#dde5ee'],
    sun: 'none',
    cloudCount: 6,
    cloudColor: [148, 163, 184],
    cloudAlpha: 0.5,
    cloudSpread: 0.24,
    rain: null,
    fogBanks: 0,
    haze: 0.08,
    snowCount: 160,
    lightning: false
  },
  heavySnow: {
    sky: ['#8495aa', '#c7d1dc'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [100, 116, 139],
    cloudAlpha: 0.62,
    cloudSpread: 0.3,
    rain: null,
    fogBanks: 3,
    haze: 0.14,
    snowCount: 300,
    lightning: false
  },
  sleet: {
    sky: ['#78899e', '#b8c5d2'],
    sun: 'none',
    cloudCount: 8,
    cloudColor: [71, 85, 105],
    cloudAlpha: 0.6,
    cloudSpread: 0.28,
    rain: { count: 100, speed: 9, wind: -1.4, alpha: 0.42, splash: true },
    fogBanks: 0,
    haze: 0.09,
    snowCount: 100,
    lightning: false
  },
  hail: {
    sky: ['#46566c', '#77889d'],
    sun: 'none',
    cloudCount: 9,
    cloudColor: [30, 41, 59],
    cloudAlpha: 0.68,
    cloudSpread: 0.3,
    rain: { count: 80, speed: 11, wind: -2.5, alpha: 0.38, splash: true },
    fogBanks: 0,
    haze: 0.1,
    snowCount: 0,
    lightning: false
  },
  smog: {
    sky: ['#8f8b7e', '#c5bca8'],
    sun: 'dim',
    cloudCount: 3,
    cloudColor: [142, 136, 119],
    cloudAlpha: 0.35,
    cloudSpread: 0.2,
    rain: null,
    fogBanks: 12,
    haze: 0.34,
    snowCount: 0,
    lightning: false
  },
  gale: {
    sky: ['#587087', '#a6b5c2'],
    sun: 'soft',
    cloudCount: 8,
    cloudColor: [203, 213, 225],
    cloudAlpha: 0.72,
    cloudSpread: 0.3,
    rain: null,
    fogBanks: 0,
    haze: 0.04,
    snowCount: 0,
    lightning: false
  },
  snow: {
    sky: ['#9fb0c4', '#dde5ee'],
    sun: 'none',
    cloudCount: 6,
    cloudColor: [148, 163, 184],
    cloudAlpha: 0.5,
    cloudSpread: 0.24,
    rain: null,
    fogBanks: 0,
    haze: 0.08,
    snowCount: 160,
    lightning: false
  }
};

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  puffs: { dx: number; dy: number; r: number }[];
}

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface Splash {
  x: number;
  r: number;
  alpha: number;
}

interface FogBank {
  x: number;
  y: number;
  rw: number;
  rh: number;
  speed: number;
  alpha: number;
}

interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  sprite: HTMLCanvasElement;
}

interface Hailstone {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  bounces: number;
  opacity: number;
}

interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  wave: number;
  alpha: number;
  width: number;
}

/** 远景雪花：柔边光点 */
const makeDotSprite = (radius: number): HTMLCanvasElement => {
  const s = Math.ceil(radius * 2 + 4);
  const cv = document.createElement('canvas');
  cv.width = s;
  cv.height = s;
  const c = cv.getContext('2d')!;
  const grad = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, radius + 1);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  c.fillStyle = grad;
  c.fillRect(0, 0, s, s);
  return cv;
};

/** 近景雪花：随机参数生成的六重对称冰晶，每片形态各不相同 */
const makeCrystalSprite = (radius: number): HTMLCanvasElement => {
  const s = Math.ceil(radius * 2 + 6);
  const cv = document.createElement('canvas');
  cv.width = s;
  cv.height = s;
  const c = cv.getContext('2d')!;
  c.translate(s / 2, s / 2);
  c.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  c.lineCap = 'round';
  c.lineWidth = Math.max(radius * 0.11, 0.7);
  c.shadowColor = 'rgba(255, 255, 255, 0.5)';
  c.shadowBlur = radius * 0.25;

  const branchPairs = 1 + Math.floor(Math.random() * 3);
  const branches = Array.from({ length: branchPairs }, () => ({
    pos: 0.3 + Math.random() * 0.5,
    len: radius * (0.22 + Math.random() * 0.34),
    angle: (Math.PI / 3) * (0.8 + Math.random() * 0.45)
  }));
  const hasTipFork = Math.random() < 0.55;
  const tipLen = radius * (0.14 + Math.random() * 0.12);
  const hasCore = Math.random() < 0.45;
  const coreR = radius * (0.14 + Math.random() * 0.14);

  for (let i = 0; i < 6; i++) {
    c.save();
    c.rotate((i * Math.PI) / 3);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -radius);

    for (const b of branches) {
      const by = -radius * b.pos;
      c.moveTo(0, by);
      c.lineTo(Math.sin(b.angle) * b.len, by - Math.cos(b.angle) * b.len);
      c.moveTo(0, by);
      c.lineTo(-Math.sin(b.angle) * b.len, by - Math.cos(b.angle) * b.len);
    }

    if (hasTipFork) {
      c.moveTo(0, -radius);
      c.lineTo(tipLen * 0.7, -radius - tipLen * 0.5);
      c.moveTo(0, -radius);
      c.lineTo(-tipLen * 0.7, -radius - tipLen * 0.5);
    }

    c.stroke();
    c.restore();
  }

  if (hasCore) {
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      const px = Math.cos(a) * coreR;
      const py = Math.sin(a) * coreR;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.stroke();
  }

  return cv;
};

const makeFlake = (width: number, height: number, y?: number): Flake => {
  const size = 1 + Math.pow(Math.random(), 1.6) * 4.2;
  const isCrystal = size >= 2.4;
  return {
    x: Math.random() * width,
    y: y ?? Math.random() * height,
    size,
    speed: 0.4 + size * 0.28 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.025,
    opacity: 0.55 + Math.random() * 0.45,
    sprite: isCrystal ? makeCrystalSprite(size * 2.4) : makeDotSprite(size)
  };
};

const displaceBolt = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rough: number,
  depth: number
): [number, number][] => {
  if (depth <= 0)
    return [
      [x1, y1],
      [x2, y2]
    ];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * rough;
  const my = (y1 + y2) / 2;
  const left = displaceBolt(x1, y1, mx, my, rough * 0.55, depth - 1);
  const right = displaceBolt(mx, my, x2, y2, rough * 0.55, depth - 1);
  return [...left.slice(0, -1), ...right];
};

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ width = 800, height = 450, weather = 'sunny' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cfg = CONFIGS[weather];
    const sunX = width * 0.72;
    const sunY = height * 0.26;
    const sunR = Math.min(width, height) * 0.09;

    const clouds: Cloud[] = Array.from({ length: cfg.cloudCount }, () => {
      const scale = 0.7 + Math.random() * 0.9;
      const puffCount = 4 + Math.floor(Math.random() * 3);
      return {
        x: Math.random() * (width + 240) - 120,
        y: height * 0.06 + Math.random() * height * cfg.cloudSpread,
        scale,
        speed: 0.12 + Math.random() * 0.22,
        puffs: Array.from({ length: puffCount }, (_, i) => ({
          dx: (i - puffCount / 2) * 26 + (Math.random() - 0.5) * 14,
          dy: (Math.random() - 0.5) * 14,
          r: 22 + Math.random() * 20
        }))
      };
    });

    const drops: Drop[] = cfg.rain
      ? Array.from({ length: cfg.rain.count }, () => ({
          x: Math.random() * (width + 160) - 80,
          y: Math.random() * height,
          len: 8 + Math.random() * 10,
          speed: cfg.rain!.speed * (0.75 + Math.random() * 0.5)
        }))
      : [];

    const splashes: Splash[] = [];

    const fogBanks: FogBank[] = Array.from({ length: cfg.fogBanks }, (_, i) => ({
      x: Math.random() * width,
      y: (i / Math.max(cfg.fogBanks - 1, 1)) * height * 0.9 + height * 0.05,
      rw: width * (0.25 + Math.random() * 0.3),
      rh: height * (0.08 + Math.random() * 0.08),
      speed: (0.1 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1),
      alpha: 0.16 + Math.random() * 0.14
    }));

    const flakes: Flake[] = Array.from({ length: cfg.snowCount }, () => makeFlake(width, height));

    const hailstones: Hailstone[] =
      weather === 'hail'
        ? Array.from({ length: 130 }, () => ({
            x: Math.random() * (width + 180) - 90,
            y: Math.random() * height,
            r: 1.8 + Math.random() * 3,
            vx: -2.2 - Math.random() * 1.8,
            vy: 8 + Math.random() * 5,
            bounces: 0,
            opacity: 0.65 + Math.random() * 0.35
          }))
        : [];

    const windStreaks: WindStreak[] =
      weather === 'gale'
        ? Array.from({ length: 46 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            length: 45 + Math.random() * 130,
            speed: 8 + Math.random() * 10,
            wave: Math.random() * Math.PI * 2,
            alpha: 0.12 + Math.random() * 0.3,
            width: 0.6 + Math.random() * 1.2
          }))
        : [];

    let t = 0;
    let flashAlpha = 0;
    let boltLife = 0;
    let boltPoints: [number, number][] = [];
    let nextStrike = 120 + Math.random() * 240;

    let frameId = 0;
    let paused = document.hidden;
    const unbindVisibility = bindVisibilityPause((hidden) => {
      paused = hidden;
    });

    const drawSky = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, cfg.sky[0]);
      grad.addColorStop(1, cfg.sky[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawSun = () => {
      if (cfg.sun === 'none') return;

      if (cfg.sun === 'full') {
        const pulse = 1 + Math.sin(t * 0.02) * 0.04;
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.4 * pulse);
        glow.addColorStop(0, 'rgba(255, 236, 168, 0.9)');
        glow.addColorStop(0.35, 'rgba(255, 214, 112, 0.32)');
        glow.addColorStop(1, 'rgba(255, 214, 112, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(t * 0.003);
        for (let i = 0; i < 12; i++) {
          ctx.rotate(Math.PI / 6);
          const rayGrad = ctx.createLinearGradient(sunR * 1.2, 0, sunR * 2.4, 0);
          rayGrad.addColorStop(0, 'rgba(255, 230, 150, 0.5)');
          rayGrad.addColorStop(1, 'rgba(255, 230, 150, 0)');
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sunR * 1.2, 0);
          ctx.lineTo(sunR * 2.4, 0);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (cfg.sun === 'soft') {
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.4);
        glow.addColorStop(0, 'rgba(255, 240, 190, 0.7)');
        glow.addColorStop(1, 'rgba(255, 240, 190, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      const alpha = cfg.sun === 'dim' ? 0.35 : 1;
      const body = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, 0, sunX, sunY, sunR);
      body.addColorStop(0, `rgba(255, 250, 224, ${alpha})`);
      body.addColorStop(1, `rgba(255, 214, 102, ${alpha})`);
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
    };

    const drawClouds = () => {
      const [r, g, b] = cfg.cloudColor;
      for (const cloud of clouds) {
        cloud.x += cloud.speed * (weather === 'gale' ? 7 : 1);
        if (cloud.x - 140 * cloud.scale > width) cloud.x = -160 * cloud.scale;

        for (const puff of cloud.puffs) {
          const px = cloud.x + puff.dx * cloud.scale;
          const py = cloud.y + puff.dy * cloud.scale;
          const pr = puff.r * cloud.scale;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${cfg.cloudAlpha})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    };

    const drawRain = () => {
      if (!cfg.rain) return;
      const { wind, alpha, splash } = cfg.rain;

      ctx.strokeStyle = `rgba(214, 228, 240, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const d of drops) {
        const mag = Math.hypot(wind, d.speed) || 1;
        const ux = wind / mag;
        const uy = d.speed / mag;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + ux * d.len, d.y + uy * d.len);

        d.x += wind;
        d.y += d.speed;
        if (d.y > height) {
          if (splash && Math.random() < 0.3 && splashes.length < 60) {
            splashes.push({ x: d.x, r: 1, alpha: 0.5 });
          }
          d.y = -d.len;
          d.x = Math.random() * (width + 160) - 80;
        }
      }
      ctx.stroke();

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.r += 0.8;
        s.alpha -= 0.035;
        if (s.alpha <= 0) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(s.x, height - 3, s.r, s.r * 0.35, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(214, 228, 240, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawFog = () => {
      const fogRgb = weather === 'smog' ? '168, 155, 126' : '226, 232, 238';
      for (const bank of fogBanks) {
        bank.x += bank.speed;
        if (bank.speed > 0 && bank.x - bank.rw > width) bank.x = -bank.rw;
        if (bank.speed < 0 && bank.x + bank.rw < 0) bank.x = width + bank.rw;

        const grad = ctx.createRadialGradient(bank.x, bank.y, 0, bank.x, bank.y, bank.rw);
        grad.addColorStop(0, `rgba(${fogRgb}, ${bank.alpha})`);
        grad.addColorStop(1, `rgba(${fogRgb}, 0)`);
        ctx.save();
        ctx.translate(bank.x, bank.y);
        ctx.scale(1, bank.rh / bank.rw);
        ctx.translate(-bank.x, -bank.y);
        ctx.beginPath();
        ctx.arc(bank.x, bank.y, bank.rw, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    };

    const drawSnow = () => {
      for (const f of flakes) {
        f.y += f.speed;
        f.x += Math.sin(t * 0.02 + f.phase) * (0.3 + f.size * 0.08) + f.drift;
        f.rotation += f.rotationSpeed;
        if (f.y - f.sprite.height > height) {
          f.y = -f.sprite.height;
          f.x = Math.random() * width;
          f.phase = Math.random() * Math.PI * 2;
          f.drift = (Math.random() - 0.5) * 0.4;
          f.opacity = 0.55 + Math.random() * 0.45;
        }
        if (f.x > width + 20) f.x = -20;
        if (f.x < -20) f.x = width + 20;

        ctx.save();
        ctx.globalAlpha = f.opacity;
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.drawImage(f.sprite, -f.sprite.width / 2, -f.sprite.height / 2);
        ctx.restore();
      }
    };

    const drawHail = () => {
      if (hailstones.length === 0) return;

      for (const h of hailstones) {
        const previousX = h.x;
        const previousY = h.y;
        h.vy += 0.16;
        h.x += h.vx;
        h.y += h.vy;

        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(h.x, h.y);
        ctx.strokeStyle = `rgba(225, 239, 250, ${h.opacity * 0.25})`;
        ctx.lineWidth = h.r * 0.65;
        ctx.stroke();

        if (h.y + h.r >= height) {
          if (h.bounces === 0) {
            h.y = height - h.r;
            h.vy *= -0.36;
            h.vx *= 0.72;
            h.bounces = 1;
          } else {
            h.x = Math.random() * (width + 180) - 90;
            h.y = -10 - Math.random() * height * 0.25;
            h.vx = -2.2 - Math.random() * 1.8;
            h.vy = 8 + Math.random() * 5;
            h.bounces = 0;
          }
        }

        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 248, 255, ${h.opacity})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(174, 207, 229, ${h.opacity * 0.75})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(h.x - h.r * 0.3, h.y - h.r * 0.3, Math.max(0.6, h.r * 0.24), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${h.opacity})`;
        ctx.fill();
      }
    };

    const drawWind = () => {
      if (windStreaks.length === 0) return;

      for (const streak of windStreaks) {
        streak.x += streak.speed;
        streak.wave += 0.04;
        if (streak.x - streak.length > width) {
          streak.x = -streak.length - Math.random() * width * 0.3;
          streak.y = Math.random() * height;
        }

        const waveY = Math.sin(streak.wave) * 8;
        const endX = streak.x + streak.length;
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.bezierCurveTo(
          streak.x + streak.length * 0.3,
          streak.y + waveY,
          streak.x + streak.length * 0.7,
          streak.y - waveY,
          endX,
          streak.y
        );
        ctx.strokeStyle = `rgba(235, 244, 250, ${streak.alpha})`;
        ctx.lineWidth = streak.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (streak.length > 100) {
          const debrisX = streak.x + streak.length * 0.58;
          const debrisY = streak.y - waveY * 0.4;
          ctx.save();
          ctx.translate(debrisX, debrisY);
          ctx.rotate(streak.wave * 2);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 1.6, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(91, 76, 52, ${streak.alpha * 1.6})`;
          ctx.fill();
          ctx.restore();
        }
      }
    };

    const drawLightning = () => {
      if (!cfg.lightning) return;

      if (t >= nextStrike) {
        nextStrike = t + 150 + Math.random() * 300;
        flashAlpha = 0.5;
        boltLife = 9;
        const sx = width * (0.15 + Math.random() * 0.7);
        boltPoints = displaceBolt(sx, height * 0.12, sx + (Math.random() - 0.5) * width * 0.2, height * 0.92, 60, 6);
      }

      if (boltLife > 0) {
        boltLife -= 1;
        const alpha = boltLife / 9;
        ctx.beginPath();
        boltPoints.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = `rgba(240, 246, 255, ${alpha})`;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#bcd7ff';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (flashAlpha > 0.01) {
        ctx.fillStyle = `rgba(226, 236, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
        flashAlpha *= 0.82;
      }
    };

    const drawHaze = () => {
      if (cfg.haze <= 0) return;
      ctx.fillStyle = weather === 'smog' ? `rgba(177, 164, 135, ${cfg.haze})` : `rgba(220, 226, 232, ${cfg.haze})`;
      ctx.fillRect(0, 0, width, height);
    };

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      if (paused) return;
      t += 1;

      drawSky();
      drawSun();
      drawClouds();
      drawFog();
      drawHaze();
      drawRain();
      drawSnow();
      drawHail();
      drawWind();
      drawLightning();
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      unbindVisibility();
    };
  }, [height, weather, width]);

  return (
    <div className={styles.weatherBackground} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
    </div>
  );
};

export default WeatherBackground;
