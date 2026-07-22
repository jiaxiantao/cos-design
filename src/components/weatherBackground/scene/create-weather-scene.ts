import { bindVisibilityPause } from '@cos-design/shared';
import { drawClouds, drawFog, drawHaze } from './draw-atmosphere';
import { drawLightning, drawWind } from './draw-effects';
import { drawHail, drawRain, drawSnow } from './draw-precipitation';
import { drawSky, drawSun } from './draw-sky';
import { createSceneState } from './init-state';
import type { WeatherSceneRuntime } from './runtime';
import type { WeatherSceneParams } from '../types';

export function createWeatherScene(params: WeatherSceneParams): () => void {
  const { ctx, width, height, activeWeather, activeNight } = params;
  const layout = createSceneState(params);
  const scene: WeatherSceneRuntime = { ctx, width, height, activeWeather, activeNight, ...layout };

  let frameId = 0;
  let paused = document.hidden;
  const unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });

  const tick = () => {
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    scene.state.t += 1;

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
  };

  tick();

  return () => {
    cancelAnimationFrame(frameId);
    unbindVisibility();
  };
}
