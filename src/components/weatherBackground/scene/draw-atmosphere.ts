import type { WeatherSceneRuntime } from './runtime';

export function drawClouds(scene: WeatherSceneRuntime) {
  const cloudMul = scene.windMotion.cloud;
  const { intensity, angle, uy } = scene.windField;
  // 云主风向向左（与降水/风条一致），速度随阵风起伏，并带轻微纵向扰动
  const dirX = -Math.cos(angle);
  for (const cloud of scene.state.clouds) {
    const step = Math.abs(cloud.speed) * cloudMul * intensity;
    cloud.x += step * dirX;
    cloud.y += step * uy * 0.12;
    if (cloud.y < -80) cloud.y = -80;
    if (cloud.y > scene.height * 0.55) cloud.y = scene.height * 0.55;
    if (cloud.x - 140 * cloud.scale > scene.width) cloud.x = -160 * cloud.scale;
    if (cloud.x + 180 * cloud.scale < 0) cloud.x = scene.width + 40 * cloud.scale;
    scene.ctx.drawImage(cloud.sprite, cloud.x + cloud.ox, cloud.y + cloud.oy);
  }
}

export function drawFog(scene: WeatherSceneRuntime) {
  const fog = scene.fogSprite;
  if (!fog || scene.state.fogBanks.length === 0) return;

  const { canvas, baseR } = fog;
  const fogMul = scene.windMotion.fog;
  const { intensity, angle, uy } = scene.windField;
  const dirX = -Math.cos(angle);
  for (const bank of scene.state.fogBanks) {
    const step = Math.abs(bank.speed) * fogMul * intensity;
    bank.x += step * dirX;
    bank.y += step * uy * 0.1;
    if (bank.y < scene.height * 0.02) bank.y = scene.height * 0.02;
    if (bank.y > scene.height * 0.95) bank.y = scene.height * 0.95;
    if (dirX < 0 && bank.x + bank.rw < 0) bank.x = scene.width + bank.rw;
    if (dirX > 0 && bank.x - bank.rw > scene.width) bank.x = -bank.rw;

    scene.ctx.save();
    scene.ctx.translate(bank.x, bank.y);
    scene.ctx.scale(bank.rw / baseR, bank.rh / baseR);
    scene.ctx.globalAlpha = bank.alpha;
    scene.ctx.drawImage(canvas, -baseR, -baseR);
    scene.ctx.restore();
  }
}

export function drawHaze(scene: WeatherSceneRuntime) {
  if (scene.cfg.haze <= 0) return;
  let hazeRgb = scene.activeWeather === 'smog' ? '177, 164, 135' : '220, 226, 232';
  if (scene.activeNight) hazeRgb = scene.activeWeather === 'smog' ? '82, 74, 54' : '116, 128, 145';
  scene.ctx.fillStyle = `rgba(${hazeRgb}, ${scene.cfg.haze})`;
  scene.ctx.fillRect(0, 0, scene.width, scene.height);
}
