import type { WeatherSceneRuntime } from './runtime';

export function drawSky(scene: WeatherSceneRuntime) {
  const grad = scene.ctx.createLinearGradient(0, 0, 0, scene.height);
  grad.addColorStop(0, scene.sky[0]);
  grad.addColorStop(1, scene.sky[1]);
  scene.ctx.fillStyle = grad;
  scene.ctx.fillRect(0, 0, scene.width, scene.height);
}

export function drawStars(scene: WeatherSceneRuntime) {
  for (const star of scene.state.stars) {
    const twinkle = 0.35 + (Math.sin(scene.state.t * star.speed + star.phase) + 1) * 0.325;
    scene.ctx.beginPath();
    scene.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    scene.ctx.fillStyle = `rgba(226, 235, 255, ${twinkle})`;
    scene.ctx.fill();
  }
}

export function drawMoon(scene: WeatherSceneRuntime) {
  if (scene.cfg.sun === 'none') return;
  const moonR = scene.sunR * 0.88;
  const dimmed = scene.cfg.sun === 'dim';

  const glow = scene.ctx.createRadialGradient(
    scene.sunX,
    scene.sunY,
    0,
    scene.sunX,
    scene.sunY,
    moonR * (dimmed ? 1.8 : 2.8)
  );
  glow.addColorStop(0, `rgba(214, 226, 245, ${dimmed ? 0.18 : 0.35})`);
  glow.addColorStop(1, 'rgba(214, 226, 245, 0)');
  scene.ctx.fillStyle = glow;
  scene.ctx.fillRect(0, 0, scene.width, scene.height);

  const bodyAlpha = dimmed ? 0.5 : 1;
  const body = scene.ctx.createRadialGradient(
    scene.sunX - moonR * 0.25,
    scene.sunY - moonR * 0.25,
    0,
    scene.sunX,
    scene.sunY,
    moonR
  );
  body.addColorStop(0, `rgba(245, 248, 252, ${bodyAlpha})`);
  body.addColorStop(1, `rgba(196, 208, 226, ${bodyAlpha})`);
  scene.ctx.beginPath();
  scene.ctx.arc(scene.sunX, scene.sunY, moonR, 0, Math.PI * 2);
  scene.ctx.fillStyle = body;
  scene.ctx.fill();

  for (const crater of scene.state.moonCraters) {
    scene.ctx.beginPath();
    scene.ctx.arc(scene.sunX + crater.dx * moonR, scene.sunY + crater.dy * moonR, crater.r * moonR, 0, Math.PI * 2);
    scene.ctx.fillStyle = `rgba(170, 184, 206, ${bodyAlpha * 0.55})`;
    scene.ctx.fill();
  }
}

export function drawSun(scene: WeatherSceneRuntime) {
  if (scene.activeNight) {
    drawStars(scene);
    drawMoon(scene);
    return;
  }
  if (scene.cfg.sun === 'none') return;

  if (scene.cfg.sun === 'full') {
    const pulse = 1 + Math.sin(scene.state.t * 0.02) * 0.04;
    const glow = scene.ctx.createRadialGradient(
      scene.sunX,
      scene.sunY,
      0,
      scene.sunX,
      scene.sunY,
      scene.sunR * 3.4 * pulse
    );
    glow.addColorStop(0, 'rgba(255, 236, 168, 0.9)');
    glow.addColorStop(0.35, 'rgba(255, 214, 112, 0.32)');
    glow.addColorStop(1, 'rgba(255, 214, 112, 0)');
    scene.ctx.fillStyle = glow;
    scene.ctx.fillRect(0, 0, scene.width, scene.height);

    scene.ctx.save();
    scene.ctx.translate(scene.sunX, scene.sunY);
    scene.ctx.rotate(scene.state.t * 0.003);
    for (let i = 0; i < 12; i++) {
      scene.ctx.rotate(Math.PI / 6);
      const rayGrad = scene.ctx.createLinearGradient(scene.sunR * 1.2, 0, scene.sunR * 2.4, 0);
      rayGrad.addColorStop(0, 'rgba(255, 230, 150, 0.5)');
      rayGrad.addColorStop(1, 'rgba(255, 230, 150, 0)');
      scene.ctx.strokeStyle = rayGrad;
      scene.ctx.lineWidth = 3;
      scene.ctx.beginPath();
      scene.ctx.moveTo(scene.sunR * 1.2, 0);
      scene.ctx.lineTo(scene.sunR * 2.4, 0);
      scene.ctx.stroke();
    }
    scene.ctx.restore();
  }

  if (scene.cfg.sun === 'soft') {
    const glow = scene.ctx.createRadialGradient(scene.sunX, scene.sunY, 0, scene.sunX, scene.sunY, scene.sunR * 2.4);
    glow.addColorStop(0, 'rgba(255, 240, 190, 0.7)');
    glow.addColorStop(1, 'rgba(255, 240, 190, 0)');
    scene.ctx.fillStyle = glow;
    scene.ctx.fillRect(0, 0, scene.width, scene.height);
  }

  const alpha = scene.cfg.sun === 'dim' ? 0.35 : 1;
  const body = scene.ctx.createRadialGradient(
    scene.sunX - scene.sunR * 0.2,
    scene.sunY - scene.sunR * 0.2,
    0,
    scene.sunX,
    scene.sunY,
    scene.sunR
  );
  body.addColorStop(0, `rgba(255, 250, 224, ${alpha})`);
  body.addColorStop(1, `rgba(255, 214, 102, ${alpha})`);
  scene.ctx.beginPath();
  scene.ctx.arc(scene.sunX, scene.sunY, scene.sunR, 0, Math.PI * 2);
  scene.ctx.fillStyle = body;
  scene.ctx.fill();
}
