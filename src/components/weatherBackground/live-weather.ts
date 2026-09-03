import { useEffect, useState } from 'react';
import type { DayCycleTimes } from './day-cycle';
import {
  IDLE_LIVE_WEATHER,
  fetchSunTimes,
  isValidCoords,
  subscribeLiveWeather,
  type LiveWeatherCoords,
  type LiveWeatherState,
} from './live-weather-core';

export type {
  LiveWeatherCoords,
  LiveWeatherState,
  LiveWeatherStatus,
  OpenMeteoCurrent,
} from './live-weather-core';
export {
  fetchLiveWeather,
  fetchSunTimes,
  formatLocalHm,
  getDayCycleTimesFromLive,
  IDLE_LIVE_WEATHER,
  isValidCoords,
  mapWmoCodeToWeatherType,
  subscribeLiveWeather,
  subscribeSunTimes,
} from './live-weather-core';

/**
 * Open-Meteo 实况天气。
 * 传入 coords 时直接按该经纬度查询；未传时使用浏览器定位（需 HTTPS 与用户授权）。
 * 失败时 status 为 error，调用方自行回退。
 */
export const useLiveWeather = (enabled = true, coords?: LiveWeatherCoords): LiveWeatherState => {
  const hasCoords = isValidCoords(coords);
  const latitude = hasCoords ? coords.latitude : null;
  const longitude = hasCoords ? coords.longitude : null;
  const requestKey = `${enabled}:${latitude},${longitude}`;

  const initialState: LiveWeatherState = !enabled
    ? IDLE_LIVE_WEATHER
    : hasCoords
      ? { ...IDLE_LIVE_WEATHER, status: 'fetching' }
      : { ...IDLE_LIVE_WEATHER, status: 'locating' };

  const [state, setState] = useState<LiveWeatherState>(initialState);
  const [prevKey, setPrevKey] = useState(requestKey);

  if (prevKey !== requestKey) {
    setPrevKey(requestKey);
    setState((prev) =>
      enabled && prev.weather
        ? { ...initialState, weather: prev.weather, current: prev.current }
        : initialState,
    );
  }

  useEffect(
    () => subscribeLiveWeather(enabled, coords, setState),
    [coords, enabled, latitude, longitude],
  );

  return state;
};

/**
 * 按经纬度获取当地日出日落，用于 `time` 参数判断昼夜。
 * 未传 coords 或请求失败时不更新（调用方回退 approximateDayCycleTimes）。
 */
export const useSunTimes = (coords?: LiveWeatherCoords): DayCycleTimes | null => {
  const hasCoords = isValidCoords(coords);
  const latitude = hasCoords ? coords.latitude : null;
  const longitude = hasCoords ? coords.longitude : null;
  const requestKey = `${latitude},${longitude}`;

  const [times, setTimes] = useState<DayCycleTimes | null>(null);
  const [prevKey, setPrevKey] = useState(requestKey);

  if (prevKey !== requestKey) {
    setPrevKey(requestKey);
    setTimes(null);
  }

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    let cancelled = false;
    const controller = new AbortController();
    void fetchSunTimes(latitude, longitude, controller.signal)
      .then((result) => {
        if (!cancelled) setTimes(result);
      })
      .catch(() => {
        if (!cancelled) setTimes(null);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [latitude, longitude]);

  if (!hasCoords) return null;
  return times;
};
