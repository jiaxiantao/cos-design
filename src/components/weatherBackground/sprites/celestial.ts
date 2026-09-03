import type { CelestialSprite, MoonCrater, WeatherConfig } from '../types';

/**
 * 预渲染太阳贴图。原本每帧要创建 6+ 个径向渐变（散射 / 光冕 / 霾 / bloom / 日轮），
 * 这里一次性烘焙到离屏 canvas，主循环只需按 breath 缩放绘制。
 */
export function makeSunSprite(cfg: WeatherConfig, sunR: number): CelestialSprite | null {
  const mode = cfg.sun;
  if (mode === 'none') return null;

  const intensity = mode === 'full' ? 1 : mode === 'soft' ? 0.62 : 0.32;
  const diskR = sunR * (mode === 'full' ? 0.72 : mode === 'soft' ? 0.62 : 0.5);
  const scatterR = sunR * (mode === 'full' ? 7.2 : mode === 'soft' ? 5.2 : 3.6);

  // 贴图包围盒：取所有光晕的最大外扩（full 模式的横向霾椭圆最宽）
  let half = scatterR;
  if (mode === 'full') half = Math.max(half, 1.55 * sunR * 5.5);
  half = Math.ceil(half + 2);
  const size = half * 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = half;
  const cy = half;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 1. 大范围大气散射
  const scatter = ctx.createRadialGradient(cx, cy, 0, cx, cy, scatterR);
  scatter.addColorStop(0, `rgba(255, 230, 170, ${0.14 * intensity})`);
  scatter.addColorStop(0.22, `rgba(255, 210, 140, ${0.07 * intensity})`);
  scatter.addColorStop(0.5, `rgba(255, 195, 120, ${0.03 * intensity})`);
  scatter.addColorStop(1, 'rgba(255, 200, 130, 0)');
  ctx.fillStyle = scatter;
  ctx.fillRect(0, 0, size, size);

  // 2. 中层光冕
  const coronaR = sunR * (mode === 'full' ? 3.4 : 2.6);
  const corona = ctx.createRadialGradient(cx, cy, diskR * 0.15, cx, cy, coronaR);
  corona.addColorStop(0, `rgba(255, 240, 200, ${0.32 * intensity})`);
  corona.addColorStop(0.4, `rgba(255, 220, 150, ${0.16 * intensity})`);
  corona.addColorStop(0.75, `rgba(255, 200, 120, ${0.05 * intensity})`);
  corona.addColorStop(1, 'rgba(255, 190, 110, 0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(cx, cy, coronaR, 0, Math.PI * 2);
  ctx.fill();

  if (mode === 'full') {
    ctx.translate(cx, cy);
    ctx.scale(1.55, 0.55);
    const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, sunR * 5.5);
    haze.addColorStop(0, 'rgba(255, 225, 170, 0.08)');
    haze.addColorStop(0.5, 'rgba(255, 205, 140, 0.03)');
    haze.addColorStop(1, 'rgba(255, 195, 130, 0)');
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.arc(0, 0, sunR * 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // 3. 近核 bloom
  const bloomR = diskR * 2.05;
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
  bloom.addColorStop(0, `rgba(255, 245, 210, ${0.7 * intensity})`);
  bloom.addColorStop(0.4, `rgba(255, 230, 170, ${0.35 * intensity})`);
  bloom.addColorStop(0.75, `rgba(255, 210, 140, ${0.1 * intensity})`);
  bloom.addColorStop(1, 'rgba(255, 200, 130, 0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
  ctx.fill();

  // 4. 日轮
  const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, diskR);
  if (mode === 'dim') {
    body.addColorStop(0, `rgba(255, 240, 210, ${0.5 * intensity})`);
    body.addColorStop(0.55, `rgba(255, 220, 170, ${0.3 * intensity})`);
    body.addColorStop(1, `rgba(255, 200, 140, 0)`);
  } else {
    body.addColorStop(0, `rgba(255, 250, 230, ${0.98 * intensity})`);
    body.addColorStop(0.4, `rgba(255, 240, 195, ${0.92 * intensity})`);
    body.addColorStop(0.75, `rgba(255, 220, 150, ${0.55 * intensity})`);
    body.addColorStop(1, `rgba(255, 205, 130, 0)`);
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, diskR, 0, Math.PI * 2);
  ctx.fill();

  return { canvas, half, breathSpeed: 0.018, breathAmp: 0.018 };
}

/**
 * 预渲染月亮贴图（含月光散射、月轮、月海、环形山、受光高光与软边 bloom）。
 * sun==='none' 时不渲染月亮（与原逻辑一致）。
 */
export function makeMoonSprite(
  cfg: WeatherConfig,
  sunR: number,
  moonCraters: MoonCrater[],
): CelestialSprite | null {
  if (cfg.sun === 'none') return null;

  const moonR = sunR * 0.82;
  const dimmed = cfg.sun === 'dim';
  const intensity = dimmed ? 0.45 : 1;
  const scatterR = moonR * (dimmed ? 4.2 : 6.2);
  const half = Math.ceil(Math.max(scatterR, moonR * 2.6, moonR * 1.35) + 2);
  const size = half * 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const mx = half;
  const my = half;

  // 1. 大范围冷色月光散射
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const scatter = ctx.createRadialGradient(mx, my, 0, mx, my, scatterR);
  scatter.addColorStop(0, `rgba(200, 215, 240, ${0.16 * intensity})`);
  scatter.addColorStop(0.25, `rgba(170, 190, 225, ${0.07 * intensity})`);
  scatter.addColorStop(0.55, `rgba(140, 165, 210, ${0.025 * intensity})`);
  scatter.addColorStop(1, 'rgba(130, 155, 200, 0)');
  ctx.fillStyle = scatter;
  ctx.fillRect(0, 0, size, size);

  const coronaR = moonR * 2.6;
  const corona = ctx.createRadialGradient(mx, my, moonR * 0.2, mx, my, coronaR);
  corona.addColorStop(0, `rgba(230, 236, 248, ${0.28 * intensity})`);
  corona.addColorStop(0.45, `rgba(190, 205, 230, ${0.12 * intensity})`);
  corona.addColorStop(1, 'rgba(160, 180, 220, 0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(mx, my, coronaR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. 月轮本体
  const body = ctx.createRadialGradient(mx - moonR * 0.28, my - moonR * 0.3, 0, mx, my, moonR);
  body.addColorStop(0, `rgba(236, 240, 246, ${0.96 * intensity})`);
  body.addColorStop(0.45, `rgba(214, 220, 230, ${0.94 * intensity})`);
  body.addColorStop(0.82, `rgba(186, 196, 212, ${0.9 * intensity})`);
  body.addColorStop(1, `rgba(160, 172, 192, ${0.75 * intensity})`);
  ctx.beginPath();
  ctx.arc(mx, my, moonR, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // 3. 月海 / 撞击坑
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, moonR * 0.98, 0, Math.PI * 2);
  ctx.clip();

  const maria = [
    { dx: -0.18, dy: 0.12, rx: 0.38, ry: 0.28, a: 0.14 },
    { dx: 0.22, dy: -0.08, rx: 0.26, ry: 0.2, a: 0.11 },
    { dx: 0.05, dy: 0.32, rx: 0.2, ry: 0.14, a: 0.09 },
  ];
  for (const m of maria) {
    const cx = mx + m.dx * moonR;
    const cy = my + m.dy * moonR;
    const patch = ctx.createRadialGradient(cx, cy, 0, cx, cy, m.rx * moonR);
    patch.addColorStop(0, `rgba(140, 152, 170, ${m.a * intensity})`);
    patch.addColorStop(0.65, `rgba(150, 162, 178, ${m.a * 0.45 * intensity})`);
    patch.addColorStop(1, 'rgba(160, 170, 185, 0)');
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.ellipse(cx, cy, m.rx * moonR, m.ry * moonR, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const crater of moonCraters) {
    const cx = mx + crater.dx * moonR;
    const cy = my + crater.dy * moonR;
    const r = crater.r * moonR;
    const dent = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, 0, cx, cy, r);
    dent.addColorStop(0, `rgba(155, 168, 186, ${0.22 * intensity})`);
    dent.addColorStop(0.55, `rgba(145, 158, 176, ${0.28 * intensity})`);
    dent.addColorStop(0.85, `rgba(200, 210, 224, ${0.12 * intensity})`);
    dent.addColorStop(1, 'rgba(210, 218, 230, 0)');
    ctx.fillStyle = dent;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 受光侧高光
  const sheen = ctx.createRadialGradient(
    mx - moonR * 0.35,
    my - moonR * 0.38,
    0,
    mx - moonR * 0.1,
    my - moonR * 0.1,
    moonR * 0.7,
  );
  sheen.addColorStop(0, `rgba(255, 255, 255, ${0.28 * intensity})`);
  sheen.addColorStop(0.45, `rgba(245, 248, 252, ${0.08 * intensity})`);
  sheen.addColorStop(1, 'rgba(240, 244, 250, 0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(mx, my, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. 软边缘 bloom
  const rim = ctx.createRadialGradient(mx, my, moonR * 0.72, mx, my, moonR * 1.35);
  rim.addColorStop(0, 'rgba(210, 220, 235, 0)');
  rim.addColorStop(0.55, `rgba(200, 212, 232, ${0.1 * intensity})`);
  rim.addColorStop(1, 'rgba(180, 195, 220, 0)');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(mx, my, moonR * 1.35, 0, Math.PI * 2);
  ctx.fill();

  return { canvas, half, breathSpeed: 0.012, breathAmp: 0.012 };
}
