import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  useLiveWeather,
  useSunTimes,
} from '../../src/components/weatherBackground/vue/useLiveWeather';

describe('@cos-design/weather-background/vue entry', () => {
  const entry = readFileSync('packages/weatherBackground/src/vue.ts', 'utf8');

  it('re-exports the documented composables', () => {
    expect(entry).toMatch(/useLiveWeather,/);
    expect(entry).toMatch(/useSunTimes,/);
    expect(entry).toContain("from '../../../src/components/weatherBackground/vue/useLiveWeather'");
    expect(entry).toContain('export { default as WeatherBackground }');
  });

  it('re-exports the live-weather helpers and types the Vue docs import', () => {
    for (const name of [
      'mapWmoCodeToWeatherType',
      'fetchLiveWeather',
      'fetchSunTimes',
      'subscribeLiveWeather',
      'subscribeSunTimes',
      'LiveWeatherCoords',
      'LiveWeatherState',
    ]) {
      expect(entry).toContain(name);
    }
  });

  it('implements useLiveWeather and useSunTimes as functions', () => {
    expect(typeof useLiveWeather).toBe('function');
    expect(typeof useSunTimes).toBe('function');
  });
});
