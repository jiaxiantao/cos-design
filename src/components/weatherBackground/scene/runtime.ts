import type { CelestialSprite, FogSprite, SceneState, WeatherConfig, WeatherType } from '../types';
import type { DayCycleState, DayCycleTimes } from '../day-cycle';
import type { HailIntensitySpec } from '../hail-level';
import type { WindFieldSample, WindMotion } from '../wind';

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
  /** 缓存的天空线性渐变 */
  skyGradient: CanvasGradient;
  /** 当前绘制的日/月贴图 */
  celestial: CelestialSprite | null;
  /** 预烘焙太阳（日弧模式下与月亮并存） */
  sunSprite: CelestialSprite | null;
  /** 预烘焙月亮 */
  moonSprite: CelestialSprite | null;
  /** 预渲染的雾团贴图，无雾时为 null */
  fogSprite: FogSprite | null;
  /** 当地日出日落 */
  dayCycleTimes: DayCycleTimes | null;
  dayCycle: DayCycleState | null;
  sceneTimeMs: number;
  liveClock: boolean;
  windMotion: WindMotion;
  /** 本帧全局风场（阵风 + 风向），绘制前更新 */
  windField: WindFieldSample;
  /** 冰雹强度规格；非冰雹为 null */
  hailSpec: HailIntensitySpec | null;
  state: SceneState;
}
