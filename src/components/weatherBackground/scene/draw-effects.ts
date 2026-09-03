import { displaceBolt } from '../lightning';
import { sampleWindField } from '../wind';
import type { WeatherSceneRuntime } from './runtime';

export function drawWind(scene: WeatherSceneRuntime) {
  if (scene.state.windStreaks.length === 0) return;

  const streakMul = scene.windMotion.streak;
  const vis = scene.windMotion.streakVisibility;
  if (vis <= 0.02) return;

  const t = scene.state.t;
  // 风条主风向与降水一致：向左（负 x），再叠加风场偏角
  const baseSign = -1;

  for (const streak of scene.state.windStreaks) {
    const local = sampleWindField(t + streak.phase * 18, scene.windMotion, streak.x, streak.y);
    const intensity = local.intensity * (0.55 + 0.45 * scene.windField.intensity);
    const angle = local.angle * 0.65 + scene.windField.angle * 0.35;
    const ux = baseSign * Math.cos(angle);
    const uy = Math.sin(angle);

    const step = streak.speed * streakMul * intensity;
    streak.x += step * ux;
    streak.y += step * uy * 0.45;
    streak.wave += 0.03 + intensity * 0.025;

    // 出界后从上风侧重生
    if (streak.x < -streak.length - 40 || streak.x > scene.width + streak.length + 40) {
      streak.x =
        ux < 0
          ? scene.width + streak.length + Math.random() * scene.width * 0.25
          : -streak.length - Math.random() * scene.width * 0.25;
      streak.y = Math.random() * scene.height;
    }
    if (streak.y < -20) streak.y = scene.height + 10;
    if (streak.y > scene.height + 20) streak.y = -10;

    const waveAmp = 5 + intensity * 5;
    const waveY = Math.sin(streak.wave) * waveAmp;
    const len = streak.length * (0.85 + intensity * 0.2);
    const endX = streak.x + ux * len;
    const endY = streak.y + uy * len * 0.45;
    const alpha = streak.alpha * vis * Math.min(1.35, 0.55 + intensity * 0.55);

    scene.ctx.beginPath();
    scene.ctx.moveTo(streak.x, streak.y);
    scene.ctx.bezierCurveTo(
      streak.x + ux * len * 0.3,
      streak.y + uy * len * 0.3 * 0.45 + waveY,
      streak.x + ux * len * 0.7,
      streak.y + uy * len * 0.7 * 0.45 - waveY,
      endX,
      endY,
    );
    scene.ctx.strokeStyle = `rgba(235, 244, 250, ${alpha})`;
    scene.ctx.lineWidth = streak.width * (0.85 + intensity * 0.2);
    scene.ctx.lineCap = 'round';
    scene.ctx.stroke();

    if (streak.length > 70 && vis > 0.45 && intensity > 0.7) {
      const debrisX = streak.x + ux * len * 0.58;
      const debrisY = streak.y + uy * len * 0.58 * 0.45 - waveY * 0.4;
      scene.ctx.save();
      scene.ctx.translate(debrisX, debrisY);
      scene.ctx.rotate(angle + streak.wave * 2);
      scene.ctx.beginPath();
      scene.ctx.ellipse(0, 0, 4, 1.6, 0, 0, Math.PI * 2);
      scene.ctx.fillStyle = `rgba(91, 76, 52, ${alpha * 1.4})`;
      scene.ctx.fill();
      scene.ctx.restore();
    }
  }
}

export function drawLightning(scene: WeatherSceneRuntime) {
  if (!scene.cfg.lightning) return;

  if (scene.state.t >= scene.state.nextStrike) {
    scene.state.nextStrike = scene.state.t + 150 + Math.random() * 300;
    scene.state.flashAlpha = 0.5;
    scene.state.boltLife = 9;
    const sx = scene.width * (0.15 + Math.random() * 0.7);
    scene.state.boltPoints = displaceBolt(
      sx,
      scene.height * 0.12,
      sx + (Math.random() - 0.5) * scene.width * 0.2,
      scene.height * 0.92,
      60,
      6,
    );
  }

  if (scene.state.boltLife > 0) {
    scene.state.boltLife -= 1;
    const alpha = scene.state.boltLife / 9;
    scene.ctx.beginPath();
    scene.state.boltPoints.forEach(([x, y], i) =>
      i === 0 ? scene.ctx.moveTo(x, y) : scene.ctx.lineTo(x, y),
    );
    scene.ctx.strokeStyle = `rgba(240, 246, 255, ${alpha})`;
    scene.ctx.lineWidth = 2.4;
    scene.ctx.shadowColor = '#bcd7ff';
    scene.ctx.shadowBlur = 16;
    scene.ctx.stroke();
    scene.ctx.shadowBlur = 0;
  }

  if (scene.state.flashAlpha > 0.01) {
    scene.ctx.fillStyle = `rgba(226, 236, 255, ${scene.state.flashAlpha})`;
    scene.ctx.fillRect(0, 0, scene.width, scene.height);
    scene.state.flashAlpha *= 0.82;
  }
}
