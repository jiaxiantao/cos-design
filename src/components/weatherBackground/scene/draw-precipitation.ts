import { resetHailstone } from '../sprites/hail';
import { sampleWindField } from '../wind';
import type { WeatherSceneRuntime } from './runtime';

export function drawRain(scene: WeatherSceneRuntime) {
  if (!scene.cfg.rain) return;
  const { alpha, splash } = scene.cfg.rain;
  const baseWind = scene.cfg.rain.wind * scene.windMotion.rain;
  const { intensity, angle, uy } = scene.windField;
  // 水平随阵风缩放；竖直微扰让雨丝倾角时不时变化
  const windX = baseWind * intensity * Math.cos(angle);
  const windYBoost = Math.abs(baseWind) * intensity * uy * 0.35;

  scene.ctx.strokeStyle = `rgba(214, 228, 240, ${alpha})`;
  scene.ctx.lineWidth = 1.2;
  scene.ctx.beginPath();
  for (const d of scene.state.drops) {
    const fall = d.speed + windYBoost;
    const mag = Math.hypot(windX, fall) || 1;
    const ux = windX / mag;
    const uyDrop = fall / mag;
    scene.ctx.moveTo(d.x, d.y);
    scene.ctx.lineTo(d.x + ux * d.len, d.y + uyDrop * d.len);

    d.x += windX;
    d.y += fall;
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
  const windDrift = scene.windMotion.snowDrift;
  const { intensity, angle, uy } = scene.windField;
  const driftX = windDrift * intensity * Math.cos(angle);
  const driftY = Math.abs(windDrift) * intensity * uy * 0.4;

  for (const f of scene.state.flakes) {
    f.y += f.speed + driftY;
    f.x += Math.sin(scene.state.t * 0.02 + f.phase) * (0.3 + f.size * 0.08) + f.drift + driftX;
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
  const hailMul = scene.windMotion.hail;
  const t = scene.state.t;
  const global = scene.windField;

  for (const h of scene.state.hailstones) {
    if (h.delay > 0) {
      h.delay -= 1;
      continue;
    }

    const local = sampleWindField(t + h.phase * 12, scene.windMotion, h.x, h.y);
    const intensity = local.intensity * (0.4 + 0.6 * global.intensity);
    const angle = local.angle * 0.5 + global.angle * 0.5;
    const lateral = scene.windMotion.snowDrift * 0.45 * intensity * Math.cos(angle);
    const lift = Math.abs(scene.windMotion.snowDrift) * intensity * Math.sin(angle) * 0.2;

    const previousX = h.x;
    const previousY = h.y;
    h.vy += h.gravity + lift * 0.02;
    h.vx +=
      h.gust * 0.004 * hailMul * intensity +
      lateral +
      (Math.random() - 0.5) * 0.08 * hailMul * intensity;
    h.x += h.vx + Math.sin(t * 0.028 + h.phase) * 0.35;
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
        resetHailstone(
          h,
          scene.width,
          scene.height,
          pool,
          true,
          scene.hailSpec ? { min: scene.hailSpec.sizeMin, max: scene.hailSpec.sizeMax } : undefined,
          scene.hailSpec?.speedMul ?? 1,
        );
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
