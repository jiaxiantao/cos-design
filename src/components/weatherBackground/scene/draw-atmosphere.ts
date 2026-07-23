import type { WeatherSceneRuntime } from './runtime';

export function drawClouds(scene: WeatherSceneRuntime) {
  const gale = scene.activeWeather === 'gale' ? 7 : 1;
  for (const cloud of scene.state.clouds) {
    cloud.x += cloud.speed * gale;
    if (cloud.x - 140 * cloud.scale > scene.width) cloud.x = -160 * cloud.scale;
    scene.ctx.drawImage(cloud.sprite, cloud.x + cloud.ox, cloud.y + cloud.oy);
  }
}

export function drawFog(scene: WeatherSceneRuntime) {
  const fog = scene.fogSprite;
  if (!fog || scene.state.fogBanks.length === 0) return;

  const { canvas, baseR } = fog;
  for (const bank of scene.state.fogBanks) {
    bank.x += bank.speed;
    if (bank.speed > 0 && bank.x - bank.rw > scene.width) bank.x = -bank.rw;
    if (bank.speed < 0 && bank.x + bank.rw < 0) bank.x = scene.width + bank.rw;

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
