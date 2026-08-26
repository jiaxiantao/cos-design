import { bindPrefersReducedMotion, bindVisibilityPause, prefersReducedMotion } from '@cos-design/shared';
import { sampleWindField } from '../wind';
import { drawClouds, drawFog, drawHaze } from './draw-atmosphere';
import { drawLightning, drawWind } from './draw-effects';
import { drawHail, drawRain, drawSnow } from './draw-precipitation';
import { drawSky, drawSun } from './draw-sky';
import { applyDayCycleToScene, createSceneState } from './init-state';
import type { WeatherSceneRuntime } from './runtime';
import type { WeatherSceneParams } from '../types';

function paintFrame(scene: WeatherSceneRuntime, animate: boolean) {
  if (animate) scene.state.t += 1;

  // 每帧刷新全局风场：整体阵风节奏一致，局部再按坐标扰动
  scene.windField = sampleWindField(scene.state.t, scene.windMotion);

  if (scene.dayCycleTimes) {
    applyDayCycleToScene(scene, scene.liveClock ? Date.now() : scene.sceneTimeMs);
  }

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
  const { ctx, width, height, activeWeather, activeNight, windMotion } = params;
  const layout = createSceneState(params);
  const scene: WeatherSceneRuntime = {
    ctx,
    width,
    height,
    activeWeather,
    activeNight: layout.dayCycle ? !layout.dayCycle.isDay : activeNight,
    windMotion,
    windField: sampleWindField(0, windMotion),
    ...layout
  };

  if (scene.dayCycleTimes) {
    applyDayCycleToScene(scene, scene.liveClock ? Date.now() : scene.sceneTimeMs);
  }

  let paused = document.hidden;
  let reduced = prefersReducedMotion();
  const unbindVisibility = bindVisibilityPause((hidden) => {
    paused = hidden;
  });
  const unbindMotion = bindPrefersReducedMotion((value) => {
    reduced = value;
  });

  // 降级：只画一帧静态画面，不启动动画循环
  if (reduced) {
    paintFrame(scene, false);
    return () => {
      unbindVisibility();
      unbindMotion();
    };
  }

  let frameId = 0;

  const tick = () => {
    frameId = requestAnimationFrame(tick);
    if (paused) return;
    if (reduced) return;
    paintFrame(scene, true);
  };

  tick();

  return () => {
    cancelAnimationFrame(frameId);
    unbindVisibility();
    unbindMotion();
  };
}
