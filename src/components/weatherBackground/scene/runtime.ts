import type { SceneState, WeatherConfig, WeatherType } from '../types';

export interface WeatherSceneRuntime {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  activeWeather: WeatherType;
  activeNight: boolean;
  sky: [string, string];
  cloudRgb: [number, number, number];
  cfg: WeatherConfig;
  sunX: number;
  sunY: number;
  sunR: number;
  state: SceneState;
}
