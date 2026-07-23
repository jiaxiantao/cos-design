import type { WeatherSceneRuntime } from './runtime';

export function drawSky(scene: WeatherSceneRuntime) {
  scene.ctx.fillStyle = scene.skyGradient;
  scene.ctx.fillRect(0, 0, scene.width, scene.height);
}

export function drawStars(scene: WeatherSceneRuntime) {
  if (scene.state.stars.length === 0) return;
  for (const star of scene.state.stars) {
    const twinkle = 0.35 + (Math.sin(scene.state.t * star.speed + star.phase) + 1) * 0.325;
    scene.ctx.beginPath();
    scene.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    scene.ctx.fillStyle = `rgba(226, 235, 255, ${twinkle})`;
    scene.ctx.fill();
  }
}

/** 绘制预烘焙的日/月贴图，仅按 breath 做微缩放 */
function drawCelestial(scene: WeatherSceneRuntime) {
  const sprite = scene.celestial;
  if (!sprite) return;

  const { ctx, sunX, sunY, state } = scene;
  const breath = 1 + Math.sin(state.t * sprite.breathSpeed) * sprite.breathAmp;
  const half = sprite.half * breath;
  const size = half * 2;

  // 光晕的 lighter 叠色已在贴图烘焙阶段完成，这里用 source-over 绘制即可
  ctx.drawImage(sprite.canvas, sunX - half, sunY - half, size, size);
}

export function drawSun(scene: WeatherSceneRuntime) {
  if (scene.activeNight) {
    drawStars(scene);
    drawCelestial(scene);
    return;
  }
  drawCelestial(scene);
}
