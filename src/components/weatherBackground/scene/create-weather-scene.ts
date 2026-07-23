import { bindVisibilityPause } from '@cos-design/shared';
import { drawClouds, drawFog, drawHaze } from './draw-atmosphere';
import { drawLightning, drawWind } from './draw-effects';
import { drawHail, drawRain, drawSnow } from './draw-precipitation';
import { drawSky, drawSun } from './draw-sky';
import { createSceneState } from './init-state';
import type { WeatherSceneRuntime } from './runtime';
import type { WeatherSceneParams } from '../types';

function paintFrame(scene: WeatherSceneRuntime, animate: boolean) {
  if (animate) scene.state.t += 1;
  drawSky(scene);
  drawSun(scene);
  drawClouds(scene);
  drawFog(scene);
  drawHaze(scene);
  drawRain(scene);
  drawSnow(scene);
  drawHail(scene);
  drawWind(scene);
  drawLightning(scene);
}

export function createWeatherScene(params: WeatherSceneParams): () => void {
  const { ctx, width, height, activeWeather, activeNight } = params;
  const layout = createSceneState(params);
  const scene: WeatherSceneRuntime = { ctx, width, height, activeWeather, activeNight, ...layout };

  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 降级：只画一帧静态画面，不启动动画循环
  if (reduceMotion) {
    paintFrame(scene, false);
    return () => undefined;
  }

  let frameId = 0;
  let paused = document.hidden;
  const unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });

  const tick = () => {
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    paintFrame(scene, true);
  };

  tick();

  return () => {
    cancelAnimationFrame(frameId);
    unbindVisibility();
  };
}
