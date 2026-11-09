import { onUnmounted, ref, watch, type Ref } from 'vue';
import type { DayCycleTimes } from '../day-cycle';
import {
  IDLE_LIVE_WEATHER,
  fetchSunTimes,
  isValidCoords,
  subscribeLiveWeather,
  type LiveWeatherCoords,
  type LiveWeatherState,
} from '../live-weather-core';

export type {
  LiveWeatherCoords,
  LiveWeatherState,
  LiveWeatherStatus,
  OpenMeteoCurrent,
} from '../live-weather-core';

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
} from '../live-weather-core';

const initialLiveState = (enabled: boolean, coords?: LiveWeatherCoords): LiveWeatherState => {
  const hasCoords = isValidCoords(coords);
  if (!enabled) return IDLE_LIVE_WEATHER;
  if (hasCoords) return { ...IDLE_LIVE_WEATHER, status: 'fetching' };
  return { ...IDLE_LIVE_WEATHER, status: 'locating' };
};

/**
 * Open-Meteo 实况天气（Vue composable，语义与 React `useLiveWeather` 对齐）。
 * @param enabled 是否启用实况拉取
 * @param coords 指定经纬度；省略时使用浏览器定位（需 HTTPS 与用户授权）
 */
export function useLiveWeather(enabled = true, coords?: LiveWeatherCoords): Ref<LiveWeatherState> {
  const state = ref<LiveWeatherState>(initialLiveState(enabled, coords));
  let stop: (() => void) | null = null;

  const sync = () => {
    stop?.();
    stop = subscribeLiveWeather(enabled, coords, (next) => {
      state.value = next;
    });
  };

  watch(
    () => [enabled, coords?.latitude, coords?.longitude] as const,
    () => {
      state.value = initialLiveState(enabled, coords);
      sync();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stop?.();
    stop = null;
  });

  return state;
}

/**
 * 按经纬度获取当地日出日落（用于 `time` / 昼夜判断），与 React `useSunTimes` 对齐。
 */
export function useSunTimes(coords?: LiveWeatherCoords): Ref<DayCycleTimes | null> {
  const times = ref<DayCycleTimes | null>(null);

  watch(
    () => [isValidCoords(coords), coords?.latitude, coords?.longitude] as const,
    ([valid, lat, lon], _prev, onCleanup) => {
      if (!valid || lat == null || lon == null) {
        times.value = null;
        return;
      }
      const controller = new AbortController();
      let cancelled = false;
      void fetchSunTimes(lat, lon, controller.signal)
        .then((result) => {
          if (!cancelled) times.value = result;
        })
        .catch(() => {
          if (!cancelled) times.value = null;
        });
      onCleanup(() => {
        cancelled = true;
        controller.abort();
      });
    },
    { immediate: true },
  );

  return times;
}
