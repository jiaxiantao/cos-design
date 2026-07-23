import type { CelestialSprite, FogSprite, SceneState, WeatherConfig, WeatherType } from '../types';

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
  /** 缓存的天空线性渐变（整场不变） */
  skyGradient: CanvasGradient;
  /** 预渲染的日/月贴图，白天为太阳、夜间为月亮，sun==='none' 时为 null */
  celestial: CelestialSprite | null;
  /** 预渲染的雾团贴图，无雾时为 null */
  fogSprite: FogSprite | null;
  state: SceneState;
}
