import type { WeatherSceneRuntime } from './runtime';

export function drawClouds(scene: WeatherSceneRuntime) {
  const [r, g, b] = scene.cloudRgb;
  for (const cloud of scene.state.clouds) {
    cloud.x += cloud.speed * (scene.activeWeather === 'gale' ? 7 : 1);
    if (cloud.x - 140 * cloud.scale > scene.width) cloud.x = -160 * cloud.scale;

    for (const puff of cloud.puffs) {
      const px = cloud.x + puff.dx * cloud.scale;
      const py = cloud.y + puff.dy * cloud.scale;
      const pr = puff.r * cloud.scale;
      const grad = scene.ctx.createRadialGradient(px, py, 0, px, py, pr);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${scene.cfg.cloudAlpha})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      scene.ctx.beginPath();
      scene.ctx.arc(px, py, pr, 0, Math.PI * 2);
      scene.ctx.fillStyle = grad;
      scene.ctx.fill();
    }
  }
}

export function drawFog(scene: WeatherSceneRuntime) {
  let fogRgb = scene.activeWeather === 'smog' ? '168, 155, 126' : '226, 232, 238';
  if (scene.activeNight) fogRgb = scene.activeWeather === 'smog' ? '96, 88, 66' : '138, 150, 168';
  for (const bank of scene.state.fogBanks) {
    bank.x += bank.speed;
    if (bank.speed > 0 && bank.x - bank.rw > scene.width) bank.x = -bank.rw;
    if (bank.speed < 0 && bank.x + bank.rw < 0) bank.x = scene.width + bank.rw;

    const grad = scene.ctx.createRadialGradient(bank.x, bank.y, 0, bank.x, bank.y, bank.rw);
    grad.addColorStop(0, `rgba(${fogRgb}, ${bank.alpha})`);
    grad.addColorStop(1, `rgba(${fogRgb}, 0)`);
    scene.ctx.save();
    scene.ctx.translate(bank.x, bank.y);
    scene.ctx.scale(1, bank.rh / bank.rw);
    scene.ctx.translate(-bank.x, -bank.y);
    scene.ctx.beginPath();
    scene.ctx.arc(bank.x, bank.y, bank.rw, 0, Math.PI * 2);
    scene.ctx.fillStyle = grad;
    scene.ctx.fill();
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
