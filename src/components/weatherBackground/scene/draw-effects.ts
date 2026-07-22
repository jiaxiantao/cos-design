import { displaceBolt } from '../lightning';
import type { WeatherSceneRuntime } from './runtime';

export function drawWind(scene: WeatherSceneRuntime) {
  if (scene.state.windStreaks.length === 0) return;

  for (const streak of scene.state.windStreaks) {
    streak.x += streak.speed;
    streak.wave += 0.04;
    if (streak.x - streak.length > scene.width) {
      streak.x = -streak.length - Math.random() * scene.width * 0.3;
      streak.y = Math.random() * scene.height;
    }

    const waveY = Math.sin(streak.wave) * 8;
    const endX = streak.x + streak.length;
    scene.ctx.beginPath();
    scene.ctx.moveTo(streak.x, streak.y);
    scene.ctx.bezierCurveTo(
      streak.x + streak.length * 0.3,
      streak.y + waveY,
      streak.x + streak.length * 0.7,
      streak.y - waveY,
      endX,
      streak.y
    );
    scene.ctx.strokeStyle = `rgba(235, 244, 250, ${streak.alpha})`;
    scene.ctx.lineWidth = streak.width;
    scene.ctx.lineCap = 'round';
    scene.ctx.stroke();

    if (streak.length > 100) {
      const debrisX = streak.x + streak.length * 0.58;
      const debrisY = streak.y - waveY * 0.4;
      scene.ctx.save();
      scene.ctx.translate(debrisX, debrisY);
      scene.ctx.rotate(streak.wave * 2);
      scene.ctx.beginPath();
      scene.ctx.ellipse(0, 0, 4, 1.6, 0, 0, Math.PI * 2);
      scene.ctx.fillStyle = `rgba(91, 76, 52, ${streak.alpha * 1.6})`;
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
      6
    );
  }

  if (scene.state.boltLife > 0) {
    scene.state.boltLife -= 1;
    const alpha = scene.state.boltLife / 9;
    scene.ctx.beginPath();
    scene.state.boltPoints.forEach(([x, y], i) => (i === 0 ? scene.ctx.moveTo(x, y) : scene.ctx.lineTo(x, y)));
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
