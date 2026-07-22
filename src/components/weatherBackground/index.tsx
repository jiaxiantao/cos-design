import React, { useEffect, useRef } from 'react';
import { useLiveWeather } from './live-weather';
import { createWeatherScene } from './scene/create-weather-scene';
import styles from './style/index.module.less';
import type { WeatherBackgroundProps } from './types';

export type { WeatherBackgroundProps, WeatherType } from './types';

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  width = 800,
  height = 450,
  weather = 'sunny',
  night = false,
  live = false,
  latitude,
  longitude,
  onLiveWeather,
  loading = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveState = useLiveWeather(live, latitude != null && longitude != null ? { latitude, longitude } : undefined);
  const activeWeather = live && liveState.weather ? liveState.weather : weather;
  const activeNight = live && liveState.current ? !liveState.current.isDay : night;
  const showLoading = loading || (live && (liveState.status === 'locating' || liveState.status === 'fetching'));

  const onLiveWeatherRef = useRef(onLiveWeather);
  useEffect(() => {
    onLiveWeatherRef.current = onLiveWeather;
  });

  useEffect(() => {
    if (liveState.weather) onLiveWeatherRef.current?.(liveState.weather);
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

    return createWeatherScene({ ctx, width, height, activeWeather, activeNight });
  }, [activeNight, activeWeather, height, width]);

  return (
    <div className={styles.weatherBackground} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} style={{ width, height }} />
      {showLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>天气加载中…</span>
        </div>
      )}
    </div>
  );
};

export default WeatherBackground;
