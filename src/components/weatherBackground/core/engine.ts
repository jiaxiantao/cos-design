import { observeElementSize, resolveCanvasBoxSize, applyCanvasHostBox } from '@cos-design/shared';
import { approximateDayCycleTimes, computeDayCycle, resolveSceneTimeMs } from '../day-cycle';
import { DEFAULT_FOG_LEVEL } from '../fog';
import { DEFAULT_HAIL_LEVEL } from '../hail-level';
import {
  IDLE_LIVE_WEATHER,
  subscribeLiveWeather,
  type LiveWeatherState,
} from '../live-weather-core';
import {
  DEFAULT_RAIN_LEVEL,
  DEFAULT_SNOW_LEVEL,
  normalizeWeatherType,
  resolveSceneWeather,
} from '../precipitation';
import { createWeatherScene } from '../scene/create-weather-scene';
import { DEFAULT_SMOG_LEVEL } from '../smog';
import { buildWindMotion, DEFAULT_WIND_LEVEL, resolveWindKmh } from '../wind';
import type { WeatherBackgroundController, WeatherBackgroundOptions } from './types';

const P = 'cos-weather-background';
const DEFAULT_W = 800;
const DEFAULT_H = 450;

export function createWeatherBackground(
  container: HTMLElement,
  initial: WeatherBackgroundOptions = {},
): WeatherBackgroundController {
  let options: WeatherBackgroundOptions = {
    fill: false,
    weather: 'partlyCloudy',
    time: '14:00',
    live: false,
    windLevel: DEFAULT_WIND_LEVEL,
    rainLevel: DEFAULT_RAIN_LEVEL,
    snowLevel: DEFAULT_SNOW_LEVEL,
    hailLevel: DEFAULT_HAIL_LEVEL,
    fogLevel: DEFAULT_FOG_LEVEL,
    smogLevel: DEFAULT_SMOG_LEVEL,
    loading: false,
    loadingText: '天气加载中…',
    ...initial,
  };
  let destroyed = false;
  let width = options.width ?? DEFAULT_W;
  let height = options.height ?? DEFAULT_H;
  let sizeCleanup: (() => void) | null = null;
  let sceneCleanup: (() => void) | null = null;
  let liveUnsub: (() => void) | null = null;
  let liveState: LiveWeatherState = IDLE_LIVE_WEATHER;
  const onLiveWeatherRef = { current: options.onLiveWeather };

  const root = document.createElement('div');
  root.className = P;
  const canvas = document.createElement('canvas');
  canvas.className = `${P}__canvas`;
  canvas.setAttribute('role', 'img');
  const overlay = document.createElement('div');
  overlay.className = `${P}__loading-overlay`;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  const spinner = document.createElement('div');
  spinner.className = `${P}__loading-spinner`;
  spinner.setAttribute('aria-hidden', 'true');
  const loadingLabel = document.createElement('span');
  overlay.append(spinner, loadingLabel);
  root.append(canvas, overlay);
  container.appendChild(root);

  const applyLayout = () => {
    applyCanvasHostBox(container, root, {
      fill: Boolean(options.fill),
      width: width,
      height: height,
    });
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const syncOverlay = (activeWeather: string, activeNight: boolean, windLevel: number) => {
    const showLoading =
      Boolean(options.loading) ||
      Boolean(options.live && (liveState.status === 'locating' || liveState.status === 'fetching'));
    overlay.hidden = !showLoading;
    loadingLabel.textContent = options.loadingText ?? '天气加载中…';
    canvas.setAttribute(
      'aria-label',
      options.ariaLabel ??
        `天气背景：${activeWeather}${activeNight ? '（夜间）' : ''}，${windLevel}级风`,
    );
  };

  const rebuildScene = () => {
    sceneCleanup?.();
    sceneCleanup = null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const live = Boolean(options.live);
    const activeWeather = normalizeWeatherType(
      live && liveState.weather ? liveState.weather : (options.weather ?? 'partlyCloudy'),
    );
    const effectiveRainLevel =
      live && liveState.rainLevel != null
        ? liveState.rainLevel
        : (options.rainLevel ?? DEFAULT_RAIN_LEVEL);
    const effectiveSnowLevel =
      live && liveState.snowLevel != null
        ? liveState.snowLevel
        : (options.snowLevel ?? DEFAULT_SNOW_LEVEL);
    const effectiveFogLevel =
      live && liveState.fogLevel != null
        ? liveState.fogLevel
        : (options.fogLevel ?? DEFAULT_FOG_LEVEL);
    const effectiveHailLevel =
      live && liveState.hailLevel != null
        ? liveState.hailLevel
        : (options.hailLevel ?? DEFAULT_HAIL_LEVEL);
    const effectiveSmogLevel =
      live && liveState.smogLevel != null
        ? liveState.smogLevel
        : (options.smogLevel ?? DEFAULT_SMOG_LEVEL);
    const sceneWeather = resolveSceneWeather(activeWeather, effectiveRainLevel, effectiveSnowLevel);
    const sceneTimeMs = resolveSceneTimeMs(options.time);
    const liveSunrise = liveState.current?.sunrise ?? null;
    const liveSunset = liveState.current?.sunset ?? null;
    const liveWindKmh = liveState.current?.windSpeed ?? null;
    const dayCycleTimes =
      live && liveSunrise != null && liveSunset != null
        ? { sunrise: liveSunrise, sunset: liveSunset }
        : approximateDayCycleTimes(sceneTimeMs);
    const windKmh = resolveWindKmh({
      live,
      windLevel: options.windLevel ?? DEFAULT_WIND_LEVEL,
      liveWindKmh,
    });
    const windMotion = buildWindMotion(windKmh);
    const activeNight =
      live && liveState.current
        ? !liveState.current.isDay
        : !computeDayCycle(sceneTimeMs, dayCycleTimes).isDay;

    syncOverlay(activeWeather, activeNight, windMotion.level);

    sceneCleanup = createWeatherScene({
      ctx,
      width,
      height,
      activeWeather: sceneWeather,
      activeNight,
      dayCycleTimes,
      sceneTimeMs,
      liveClock: live,
      windMotion,
      rainLevel: effectiveRainLevel,
      snowLevel: effectiveSnowLevel,
      fogLevel: effectiveFogLevel,
      hailLevel: effectiveHailLevel,
      smogLevel: effectiveSmogLevel,
    });
  };

  const bindLive = () => {
    liveUnsub?.();
    liveUnsub = null;
    if (!options.live) {
      liveState = IDLE_LIVE_WEATHER;
      rebuildScene();
      return;
    }
    const hasCoords = options.latitude != null && options.longitude != null;
    liveUnsub = subscribeLiveWeather(
      true,
      hasCoords ? { latitude: options.latitude!, longitude: options.longitude! } : undefined,
      (state) => {
        liveState = state;
        if (state.weather) onLiveWeatherRef.current?.(normalizeWeatherType(state.weather));
        rebuildScene();
      },
    );
  };

  const bindSize = () => {
    sizeCleanup?.();
    sizeCleanup = null;
    if (!(options.fill ?? false)) {
      width = options.width ?? DEFAULT_W;
      height = options.height ?? DEFAULT_H;
      applyLayout();
      rebuildScene();
      return;
    }
    sizeCleanup = observeElementSize(container, (measured) => {
      const box = resolveCanvasBoxSize({
        fill: true,
        width: options.width,
        height: options.height,
        defaultWidth: DEFAULT_W,
        defaultHeight: DEFAULT_H,
        measured,
      });
      width = box.width;
      height = box.height;
      applyLayout();
      rebuildScene();
    });
  };

  bindSize();
  bindLive();

  return {
    update(next) {
      const prev = options;
      options = { ...options, ...next };
      onLiveWeatherRef.current = options.onLiveWeather;
      const liveChanged =
        prev.live !== options.live ||
        prev.latitude !== options.latitude ||
        prev.longitude !== options.longitude;
      const sizeChanged =
        prev.fill !== options.fill ||
        prev.width !== options.width ||
        prev.height !== options.height;
      if (sizeChanged) bindSize();
      else if (liveChanged) bindLive();
      else {
        const fp = (o: typeof options) =>
          JSON.stringify(o, (_k, v) => (typeof v === 'function' ? undefined : v));
        if (fp(prev) !== fp(options)) rebuildScene();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      sceneCleanup?.();
      liveUnsub?.();
      sizeCleanup?.();
      root.remove();
    },
  };
}
