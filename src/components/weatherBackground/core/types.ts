import type { WeatherBackgroundProps, WeatherType } from '../types';

export type { WeatherBackgroundProps, WeatherType };
export type WeatherBackgroundOptions = WeatherBackgroundProps;

export interface WeatherBackgroundController {
  update(options: Partial<WeatherBackgroundOptions>): void;
  destroy(): void;
}
