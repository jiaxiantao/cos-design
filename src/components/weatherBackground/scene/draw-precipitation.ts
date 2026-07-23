import { resetHailstone } from '../sprites/hail';
import type { WeatherSceneRuntime } from './runtime';

export function drawRain(scene: WeatherSceneRuntime) {
  if (!scene.cfg.rain) return;
  const { wind, alpha, splash } = scene.cfg.rain;

  scene.ctx.strokeStyle = `rgba(214, 228, 240, ${alpha})`;
  scene.ctx.lineWidth = 1.2;
  scene.ctx.beginPath();
  for (const d of scene.state.drops) {
    const mag = Math.hypot(wind, d.speed) || 1;
    const ux = wind / mag;
    const uy = d.speed / mag;
    scene.ctx.moveTo(d.x, d.y);
    scene.ctx.lineTo(d.x + ux * d.len, d.y + uy * d.len);

    d.x += wind;
    d.y += d.speed;
    if (d.y > scene.height) {
      if (splash && Math.random() < 0.3 && scene.state.splashes.length < 60) {
        scene.state.splashes.push({ x: d.x, r: 1, alpha: 0.5 });
      }
      d.y = -d.len;
      d.x = Math.random() * (scene.width + 160) - 80;
    }
  }
  scene.ctx.stroke();

  for (let i = scene.state.splashes.length - 1; i >= 0; i--) {
    const s = scene.state.splashes[i];
    s.r += 0.8;
    s.alpha -= 0.035;
    if (s.alpha <= 0) {
      scene.state.splashes.splice(i, 1);
      continue;
    }
    scene.ctx.beginPath();
    scene.ctx.ellipse(s.x, scene.height - 3, s.r, s.r * 0.35, 0, Math.PI, Math.PI * 2);
    scene.ctx.strokeStyle = `rgba(214, 228, 240, ${s.alpha})`;
    scene.ctx.lineWidth = 1;
    scene.ctx.stroke();
  }
}

export function drawSnow(scene: WeatherSceneRuntime) {
  for (const f of scene.state.flakes) {
    f.y += f.speed;
    f.x += Math.sin(scene.state.t * 0.02 + f.phase) * (0.3 + f.size * 0.08) + f.drift;
    f.rotation += f.rotationSpeed;
    if (f.y - f.drawSize > scene.height) {
      f.y = -f.drawSize;
      f.x = Math.random() * scene.width;
      f.phase = Math.random() * Math.PI * 2;
      f.drift = (Math.random() - 0.5) * 0.4;
      f.opacity = 0.55 + Math.random() * 0.45;
    }
    if (f.x > scene.width + 20) f.x = -20;
    if (f.x < -20) f.x = scene.width + 20;

    const half = f.drawSize / 2;
    scene.ctx.save();
    scene.ctx.globalAlpha = f.opacity;
    scene.ctx.translate(f.x, f.y);
    scene.ctx.rotate(f.rotation);
    scene.ctx.drawImage(f.sprite, -half, -half, f.drawSize, f.drawSize);
    scene.ctx.restore();
  }
}

export function drawHail(scene: WeatherSceneRuntime) {
  if (scene.state.hailstones.length === 0) return;
  const pool = scene.state.hailPool;

  for (const h of scene.state.hailstones) {
    if (h.delay > 0) {
      h.delay -= 1;
      continue;
    }

    const previousX = h.x;
    const previousY = h.y;
    h.vy += h.gravity;
    h.vx += h.gust * 0.004 + (Math.random() - 0.5) * 0.06;
    h.x += h.vx + Math.sin(scene.state.t * 0.028 + h.phase) * 0.35;
    h.y += h.vy;

    scene.ctx.beginPath();
    scene.ctx.moveTo(previousX, previousY);
    scene.ctx.lineTo(h.x, h.y);
    scene.ctx.strokeStyle = `rgba(225, 239, 250, ${h.opacity * 0.18})`;
    scene.ctx.lineWidth = h.r * 0.35;
    scene.ctx.stroke();

    if (h.y + h.r >= scene.height) {
      if (h.bounces < h.maxBounces) {
        h.y = scene.height - h.r;
        h.vy *= -(0.22 + Math.random() * 0.28);
        h.vx = h.vx * (0.55 + Math.random() * 0.25) + (Math.random() - 0.5) * 1.6;
        h.bounces += 1;
      } else {
        resetHailstone(h, scene.width, scene.height, pool, true);
        continue;
      }
    }

    const half = h.drawSize / 2;
    h.rotation += h.rotationSpeed;
    scene.ctx.save();
    scene.ctx.globalAlpha = h.opacity;
    scene.ctx.translate(h.x, h.y);
    scene.ctx.rotate(h.rotation);
    scene.ctx.drawImage(h.sprite, -half, -half, h.drawSize, h.drawSize);
    scene.ctx.restore();
  }
}
