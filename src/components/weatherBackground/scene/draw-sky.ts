import { celestialDrawScale } from '../day-cycle';
import type { WeatherSceneRuntime } from './runtime';

export function drawSky(scene: WeatherSceneRuntime) {
  scene.ctx.fillStyle = scene.skyGradient;
  scene.ctx.fillRect(0, 0, scene.width, scene.height);
}

export function drawStars(scene: WeatherSceneRuntime) {
  if (scene.state.stars.length === 0) return;

  // 日弧模式：仅夜间显示，晨昏时渐入；固定夜间模式全亮
  let starAlpha = 1;
  if (scene.dayCycle) {
    if (scene.dayCycle.isDay) return;
    starAlpha = 0.35 + (1 - scene.dayCycle.twilight) * 0.65;
  } else if (!scene.activeNight) {
    return;
  }

  for (const star of scene.state.stars) {
    const twinkle = 0.35 + (Math.sin(scene.state.t * star.speed + star.phase) + 1) * 0.325;
    scene.ctx.beginPath();
    scene.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    scene.ctx.fillStyle = `rgba(226, 235, 255, ${twinkle * starAlpha})`;
    scene.ctx.fill();
  }
}

/** 绘制预烘焙的日/月贴图，仅按 breath 做微缩放 */
function drawCelestial(scene: WeatherSceneRuntime) {
  const sprite = scene.celestial;
  if (!sprite) return;

  const { ctx, sunX, sunY, state } = scene;
  const breath = 1 + Math.sin(state.t * sprite.breathSpeed) * sprite.breathAmp;
  const draw = scene.dayCycle ? celestialDrawScale(scene.dayCycle) : { scale: 1, alpha: 1 };
  const half = sprite.half * breath * draw.scale;
  const size = half * 2;

  ctx.save();
  ctx.globalAlpha = draw.alpha;
  // 光晕的 lighter 叠色已在贴图烘焙阶段完成，这里用 source-over 绘制即可
  ctx.drawImage(sprite.canvas, sunX - half, sunY - half, size, size);
  ctx.restore();
}

export function drawSun(scene: WeatherSceneRuntime) {
  if (scene.activeNight) {
    drawStars(scene);
    drawCelestial(scene);
    return;
  }
  drawCelestial(scene);
}
