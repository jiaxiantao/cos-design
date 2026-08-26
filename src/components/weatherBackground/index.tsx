import React, { useEffect, useMemo, useRef } from 'react';
import { useCanvasBox } from '@cos-design/shared';
import { approximateDayCycleTimes, computeDayCycle, resolveSceneTimeMs } from './day-cycle';
import { useLiveWeather } from './live-weather';
import { DEFAULT_FOG_LEVEL } from './fog';
import { DEFAULT_HAIL_LEVEL } from './hail-level';
import { DEFAULT_RAIN_LEVEL, DEFAULT_SNOW_LEVEL, normalizeWeatherType, resolveSceneWeather } from './precipitation';
import { DEFAULT_SMOG_LEVEL } from './smog';
import { createWeatherScene } from './scene/create-weather-scene';
import styles from './style/index.module.less';
import type { WeatherBackgroundProps } from './types';
import { buildWindMotion, DEFAULT_WIND_LEVEL, resolveWindKmh } from './wind';

export type { WeatherBackgroundProps, WeatherType } from './types';

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  width: widthProp,
  height: heightProp,
  fill: fillProp = false,
  weather = 'partlyCloudy',
  time = '14:00',
  live = false,
  latitude,
  longitude,
  windLevel = DEFAULT_WIND_LEVEL,
  rainLevel = DEFAULT_RAIN_LEVEL,
  snowLevel = DEFAULT_SNOW_LEVEL,
  hailLevel = DEFAULT_HAIL_LEVEL,
  fogLevel = DEFAULT_FOG_LEVEL,
  smogLevel = DEFAULT_SMOG_LEVEL,
  onLiveWeather,
  loading = false,
  ariaLabel,
  loadingText = '天气加载中…'
}) => {
  const { hostRef, width, height, hostStyle } = useCanvasBox({
    fill: fillProp,
    width: widthProp,
    height: heightProp,
    defaultWidth: 800,
    defaultHeight: 450
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasCoords = latitude != null && longitude != null;
  // 仅 live=true 时请求 Open-Meteo；手动模式用近似日出日落（约 06:00–18:00）
  const liveState = useLiveWeather(live, hasCoords ? { latitude, longitude } : live ? undefined : undefined);

  const activeWeather = normalizeWeatherType(live && liveState.weather ? liveState.weather : weather);
  const effectiveRainLevel = live && liveState.rainLevel != null ? liveState.rainLevel : rainLevel;
  const effectiveSnowLevel = live && liveState.snowLevel != null ? liveState.snowLevel : snowLevel;
  const effectiveFogLevel = live && liveState.fogLevel != null ? liveState.fogLevel : fogLevel;
  const effectiveHailLevel = live && liveState.hailLevel != null ? liveState.hailLevel : hailLevel;
  const effectiveSmogLevel = live && liveState.smogLevel != null ? liveState.smogLevel : smogLevel;
  const sceneWeather = resolveSceneWeather(activeWeather, effectiveRainLevel, effectiveSnowLevel);
  const sceneTimeMs = resolveSceneTimeMs(time);

  const liveSunrise = liveState.current?.sunrise ?? null;
  const liveSunset = liveState.current?.sunset ?? null;
  const liveWindKmh = liveState.current?.windSpeed ?? null;

  const dayCycleTimes = useMemo(() => {
    if (live && liveSunrise != null && liveSunset != null) {
      return { sunrise: liveSunrise, sunset: liveSunset };
    }
    return approximateDayCycleTimes(sceneTimeMs);
  }, [live, liveSunrise, liveSunset, sceneTimeMs]);

  const windKmh = resolveWindKmh({ live, windLevel, liveWindKmh });
  const windMotion = useMemo(() => buildWindMotion(windKmh), [windKmh]);

  const activeNight =
    live && liveState.current ? !liveState.current.isDay : !computeDayCycle(sceneTimeMs, dayCycleTimes).isDay;

  const showLoading = loading || (live && (liveState.status === 'locating' || liveState.status === 'fetching'));

  const onLiveWeatherRef = useRef(onLiveWeather);
  useEffect(() => {
    onLiveWeatherRef.current = onLiveWeather;
  });

  useEffect(() => {
    if (liveState.weather) onLiveWeatherRef.current?.(normalizeWeatherType(liveState.weather));
  }, [liveState.weather]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return createWeatherScene({
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
      smogLevel: effectiveSmogLevel
    });
  }, [
    activeNight,
    sceneWeather,
    dayCycleTimes,
    effectiveRainLevel,
    effectiveSnowLevel,
    effectiveFogLevel,
    effectiveHailLevel,
    effectiveSmogLevel,
    height,
    live,
    sceneTimeMs,
    width,
    windMotion
  ]);

  return (
    <div ref={hostRef} className={styles.weatherBackground} style={hostStyle}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width, height }}
        role="img"
        aria-label={ariaLabel ?? `天气背景：${activeWeather}${activeNight ? '（夜间）' : ''}，${windMotion.level}级风`}
      />
      {showLoading && (
        <div className={styles.loadingOverlay} role="status" aria-live="polite">
          <div className={styles.loadingSpinner} aria-hidden />
          <span>{loadingText}</span>
        </div>
      )}
    </div>
  );
};

export default WeatherBackground;
