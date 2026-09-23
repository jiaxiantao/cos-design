/** 肥皂泡场景光：右上角定向光 + 柔和球体明暗与投影 */

export interface SceneLighting {
  toLight: number;
  lx: number;
  ly: number;
  ax: number;
  ay: number;
}

export const resolveSceneLighting = (
  cx: number,
  cy: number,
  lightX: number,
  lightY: number,
): SceneLighting => {
  const dx = lightX - cx;
  const dy = lightY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const lx = dx / dist;
  const ly = dy / dist;
  return { toLight: Math.atan2(dy, dx), lx, ly, ax: -lx, ay: -ly };
};

export const highlightOnSphere = (
  cx: number,
  cy: number,
  r: number,
  light: SceneLighting,
  dist = 0.36,
) => ({
  x: cx + light.lx * r * dist,
  y: cy + light.ly * r * dist,
});

export const shadowPoleOnSphere = (
  cx: number,
  cy: number,
  r: number,
  light: SceneLighting,
  dist = 0.4,
) => ({
  x: cx + light.ax * r * dist,
  y: cy + light.ay * r * dist,
});

/** 多层羽化椭圆高光，避免硬边白块 */
export const paintSoftSpecular = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  peak: number,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(rx, ry);
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  core.addColorStop(0, `rgba(255,255,255,${peak})`);
  core.addColorStop(0.12, `rgba(255,255,255,${peak * 0.72})`);
  core.addColorStop(0.28, `rgba(255,255,255,${peak * 0.32})`);
  core.addColorStop(0.48, `rgba(255,255,255,${peak * 0.1})`);
  core.addColorStop(0.68, `rgba(255,255,255,${peak * 0.03})`);
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(rx * 1.55, ry * 1.45);
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  halo.addColorStop(0, `rgba(220,240,255,${peak * 0.22})`);
  halo.addColorStop(0.35, `rgba(220,240,255,${peak * 0.08})`);
  halo.addColorStop(1, 'rgba(220,240,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawSoapCastShadow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  light: SceneLighting,
  depth: number,
  alpha = 1,
) => {
  if (r < 4) return;
  const drop = r * (0.38 + depth * 0.18);
  const sx = cx + light.ax * drop;
  const sy = cy + light.ay * drop;
  const along = r * (0.9 + depth * 0.2);
  const across = r * (0.34 + depth * 0.08);

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(light.toLight);
  ctx.globalAlpha = alpha * (0.14 + depth * 0.1);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, 'rgba(4,10,18,0.38)');
  g.addColorStop(0.5, 'rgba(4,10,18,0.16)');
  g.addColorStop(0.78, 'rgba(4,10,18,0.05)');
  g.addColorStop(1, 'rgba(4,10,18,0)');
  ctx.fillStyle = g;
  ctx.scale(along, across);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export interface SphereShadeOpts {
  seed: number;
  depth: number;
  shadeAmt: number;
  rimPeak: number;
  specBright: number;
  hash01: (n: number) => number;
}

/** 纯径向叠化体积感，避免线性渐变在圆内切出三角楔形 */
const paintSoftVolume = (
  ctx: CanvasRenderingContext2D,
  R: number,
  hiX: number,
  hiY: number,
  shX: number,
  shY: number,
  opts: SphereShadeOpts,
) => {
  const { shadeAmt, hash01, seed: s } = opts;

  const base = ctx.createRadialGradient(0, 0, R * 0.08, 0, 0, R);
  base.addColorStop(0, 'rgba(220,240,255,0.09)');
  base.addColorStop(0.55, 'rgba(190,220,245,0.06)');
  base.addColorStop(0.82, 'rgba(110,150,185,0.09)');
  base.addColorStop(1, 'rgba(200,225,248,0.14)');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  const lit = ctx.createRadialGradient(hiX, hiY, 0, hiX * 0.35, hiY * 0.35, R * 1.05);
  lit.addColorStop(0, `rgba(255,255,255,${0.26 + hash01(s + 15) * 0.12})`);
  lit.addColorStop(0.35, 'rgba(245,252,255,0.14)');
  lit.addColorStop(0.65, 'rgba(210,235,255,0.04)');
  lit.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  const shade = ctx.createRadialGradient(shX, shY, 0, shX * 0.5, shY * 0.5, R * 1.02);
  shade.addColorStop(0, `rgba(8,25,40,${0.16 + shadeAmt * 0.38})`);
  shade.addColorStop(0.45, `rgba(8,25,40,${0.08 + shadeAmt * 0.2})`);
  shade.addColorStop(0.75, `rgba(8,25,40,${shadeAmt * 0.08})`);
  shade.addColorStop(1, 'rgba(8,25,40,0)');
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
};

const paintSoftRim = (
  ctx: CanvasRenderingContext2D,
  R: number,
  cx: number,
  cy: number,
  rimPeak: number,
  path?: Path2D,
) => {
  const fresnel = ctx.createRadialGradient(cx, cy, R * 0.74, cx, cy, R * 1.02);
  fresnel.addColorStop(0, 'rgba(255,255,255,0)');
  fresnel.addColorStop(0.86, 'rgba(255,255,255,0)');
  fresnel.addColorStop(0.93, `rgba(235,248,255,${0.12 + rimPeak * 0.14})`);
  fresnel.addColorStop(0.98, `rgba(255,255,255,${0.24 + rimPeak * 0.26})`);
  ctx.fillStyle = fresnel;
  if (path) ctx.fill(path);
  else {
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
  }
};

/**
 * 薄膜肥皂泡体积感：整体高透明、边缘仅菲涅尔淡亮、高光羽化。
 */
export const paintSphereShading = (
  ctx: CanvasRenderingContext2D,
  R: number,
  toLight: number,
  opts: SphereShadeOpts,
) => {
  const { rimPeak, specBright, hash01, seed: s } = opts;
  const cosL = Math.cos(toLight);
  const sinL = Math.sin(toLight);
  const hiX = cosL * R * 0.36;
  const hiY = sinL * R * 0.36;
  const shX = -cosL * R * 0.38;
  const shY = -sinL * R * 0.38;

  paintSoftVolume(ctx, R, hiX, hiY, shX, shY, opts);

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.998, 0, Math.PI * 2);
  ctx.clip();

  const specW = R * (0.2 + hash01(s + 5.2) * 0.06);
  const specH = R * (0.11 + hash01(s + 7.8) * 0.04);
  paintSoftSpecular(ctx, hiX, hiY, specW, specH, toLight - 0.3, specBright * 0.58);

  if (hash01(s + 10.1) > 0.3) {
    const hx2 = cosL * R * 0.26;
    const hy2 = sinL * R * 0.26;
    paintSoftSpecular(
      ctx,
      hx2,
      hy2,
      R * 0.09,
      R * 0.05,
      toLight - 0.15,
      0.12 + hash01(s + 28.4) * 0.14,
    );
  }

  ctx.restore();
  paintSoftRim(ctx, R, 0, 0, rimPeak);
};

export const lambertAtAngle = (angle: number, toLight: number) =>
  0.35 + 0.65 * Math.max(0, Math.cos(angle - toLight));

export const paintBlobShading = (
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  cx: number,
  cy: number,
  radius: number,
  light: SceneLighting,
  opts: SphereShadeOpts,
) => {
  const { shadeAmt, rimPeak, specBright, hash01, seed: s } = opts;
  const hi = highlightOnSphere(cx, cy, radius, light, 0.36);
  const sh = shadowPoleOnSphere(cx, cy, radius, light, 0.4);
  const extent = radius * 1.25;

  // 单中心径向叠化，避免双中心渐变在轮廓内切出三角楔形
  const body = ctx.createRadialGradient(hi.x, hi.y, 0, hi.x, hi.y, extent);
  body.addColorStop(0, `rgba(255,255,255,${0.2 + hash01(s + 15) * 0.1})`);
  body.addColorStop(0.2, 'rgba(220,240,255,0.1)');
  body.addColorStop(0.42, 'rgba(190,220,245,0.05)');
  body.addColorStop(0.62, 'rgba(130,165,190,0.04)');
  body.addColorStop(0.82, `rgba(50,80,105,${0.06 + shadeAmt * 0.35})`);
  body.addColorStop(1, `rgba(25,45,60,${0.08 + shadeAmt * 0.3})`);
  ctx.fillStyle = body;
  ctx.fill(path);

  ctx.save();
  ctx.clip(path);

  const innerShadow = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, extent * 0.92);
  innerShadow.addColorStop(0, `rgba(8,25,40,${0.14 + shadeAmt * 0.32})`);
  innerShadow.addColorStop(0.45, `rgba(8,25,40,${0.06 + shadeAmt * 0.18})`);
  innerShadow.addColorStop(1, 'rgba(8,25,40,0)');
  ctx.fillStyle = innerShadow;
  ctx.fillRect(cx - extent, cy - extent, extent * 2, extent * 2);

  const specW = radius * (0.2 + hash01(s + 5.2) * 0.06);
  const specH = radius * (0.11 + hash01(s + 7.8) * 0.04);
  paintSoftSpecular(ctx, hi.x, hi.y, specW, specH, light.toLight - 0.3, specBright * 0.55);

  ctx.restore();
  paintSoftRim(ctx, radius, cx, cy, rimPeak, path);
};
