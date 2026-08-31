import { SCENE_LIGHT_X, SCENE_LIGHT_Y } from './merge';

const TWO_PI = Math.PI * 2;

const drawSkyGradient = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a3d91');
  sky.addColorStop(0.28, '#0d47a1');
  sky.addColorStop(0.52, '#1565c0');
  sky.addColorStop(0.72, '#1e78c8');
  sky.addColorStop(0.88, '#3d93d4');
  sky.addColorStop(1, '#5eaae0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const zenith = ctx.createRadialGradient(w * 0.5, h * 0.04, 0, w * 0.5, h * 0.18, h * 0.82);
  zenith.addColorStop(0, 'rgba(7,40,120,0.32)');
  zenith.addColorStop(0.45, 'rgba(13,71,161,0.1)');
  zenith.addColorStop(1, 'rgba(13,71,161,0)');
  ctx.fillStyle = zenith;
  ctx.fillRect(0, 0, w, h);
};

const drawSun = (ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number) => {
  const glowR = w * 0.19;
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
  glow.addColorStop(0, 'rgba(255,252,240,0.18)');
  glow.addColorStop(0.4, 'rgba(255,244,220,0.06)');
  glow.addColorStop(1, 'rgba(255,230,190,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sx, sy, glowR, 0, TWO_PI);
  ctx.fill();

  const corona = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.045);
  corona.addColorStop(0, 'rgba(255,255,252,0.62)');
  corona.addColorStop(0.55, 'rgba(255,248,230,0.2)');
  corona.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(sx, sy, w * 0.045, 0, TWO_PI);
  ctx.fill();
};

/** 晴天蓝空渐变（无云） */
export const drawSoapSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  drawSkyGradient(ctx, w, h);

  const sunX = w * SCENE_LIGHT_X;
  const sunY = h * SCENE_LIGHT_Y;
  drawSun(ctx, sunX, sunY, w);

  const haze = ctx.createLinearGradient(0, h * 0.75, 0, h);
  haze.addColorStop(0, 'rgba(255,255,255,0)');
  haze.addColorStop(0.65, 'rgba(240,248,255,0.04)');
  haze.addColorStop(1, 'rgba(230,245,255,0.08)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  const sunWash = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.4);
  sunWash.addColorStop(0, 'rgba(255,252,245,0.022)');
  sunWash.addColorStop(0.45, 'rgba(255,246,232,0.006)');
  sunWash.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sunWash;
  ctx.fillRect(0, 0, w, h);
};
