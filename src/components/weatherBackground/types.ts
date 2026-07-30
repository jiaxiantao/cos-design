import type { DayCycleTimes } from './day-cycle';
import type { WindMotion } from './wind';

export type WeatherType =
  | 'sunny'
  | 'partlyCloudy'
  | 'overcast'
  /** 雨天（雨量由 rainLevel 控制） */
  | 'rain'
  /** @deprecated 请使用 weather="rain" + rainLevel={2} */
  | 'lightRain'
  /** @deprecated 请使用 weather="rain" + rainLevel={5} */
  | 'moderateRain'
  /** @deprecated 请使用 weather="rain" + rainLevel={9} */
  | 'heavyRain'
  | 'thunderstorm'
  | 'fog'
  /** 雪天（雪量由 snowLevel 控制） */
  | 'snow'
  /** @deprecated 请使用 weather="snow" + snowLevel={2} */
  | 'lightSnow'
  /** @deprecated 请使用 weather="snow" + snowLevel={5} */
  | 'moderateSnow'
  /** @deprecated 请使用 weather="snow" + snowLevel={9} */
  | 'heavySnow'
  | 'sleet'
  | 'hail'
  | 'smog'
  /** @deprecated 请用 windLevel 控制风效，不再作为独立天气场景 */
  | 'gale';

export interface WeatherBackgroundProps {
  width?: number;
  height?: number;
  /** 天气类型：sunny / partlyCloudy / overcast / rain 雨天 / thunderstorm / fog / snow 雪天 / sleet / hail / smog；雨量用 rainLevel，雪量用 snowLevel，风效用 windLevel */
  weather?: WeatherType;
  /**
   * 场景时刻 `HH:mm`，默认 `14:00`（下午）；夜间示例可用 `02:00`。
   * 昼夜由 latitude / longitude 当地日出日落判定；live 模式下忽略，改用当前时钟。
   */
  time?: string;
  /** 接入 Open-Meteo 实况：自动定位并按真实天气渲染，定位或请求失败时回退到 weather；时刻随当地时钟东升西落 */
  live?: boolean;
  /** 纬度（-90 ~ 90）：用于日出日落与昼夜判定；live 未配置时可跳过浏览器定位 */
  latitude?: number;
  /** 经度（-180 ~ 180）：与 latitude 同时配置 */
  longitude?: number;
  /** 蒲福风级 0~12，默认 3（微风）；live 模式下使用 Open-Meteo 实况风速 */
  windLevel?: number;
  /** 雨量档 1~10：1~2 毛毛雨 / 3~4 小雨 / 5~6 中雨 / 7~8 暴雨 / 9~10 特大暴雨，默认 5；rain / thunderstorm / sleet 生效；live 模式下由实况推导 */
  rainLevel?: number;
  /** 雪量档 1~10：1~2 毛毛雪 / 3~4 小雪 / 5~6 中雪 / 7~8 暴雪 / 9~10 特大暴雪，默认 5；snow / sleet 生效；live 模式下由实况推导 */
  snowLevel?: number;
  /** 冰雹强度 1~3：1 细雹 / 2 密雹 / 3 巨雹，默认 2；仅 hail 天气生效；live 模式下由实况推导 */
  hailLevel?: number;
  /** 雾浓度 1~3：1 薄雾 / 2 中雾 / 3 浓雾，默认 2；仅 fog 天气生效；live 模式下由实况推导 */
  fogLevel?: number;
  /** 霾强度 1~3：1 轻霾 / 2 中霾 / 3 重霾，默认 2；仅 smog 天气生效；live 模式下由实况推导 */
  smogLevel?: number;
  /** live 模式解析出真实天气后回调 */
  onLiveWeather?: (weather: WeatherType) => void;
  /** 外部受控 loading：在当前画面上叠加加载遮罩（live 模式定位/请求期间会自动显示，无需传入） */
  loading?: boolean;
  /** 画布无障碍标签；不传时使用默认中文描述 */
  ariaLabel?: string;
  /** 加载状态文案 */
  loadingText?: string;
}

export interface WeatherConfig {
  sky: [string, string];
  sun: 'full' | 'soft' | 'dim' | 'none';
  cloudCount: number;
  cloudColor: [number, number, number];
  cloudAlpha: number;
  cloudSpread: number;
  rain: { count: number; speed: number; wind: number; alpha: number; splash: boolean } | null;
  fogBanks: number;
  haze: number;
  snowCount: number;
  lightning: boolean;
}

export interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  puffs: { dx: number; dy: number; r: number }[];
  /** 预渲染贴图（puffs 已烘焙），每帧只平移绘制 */
  sprite: HTMLCanvasElement;
  /** 贴图左上角相对 cloud.x/cloud.y 的偏移 */
  ox: number;
  oy: number;
}

export interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

export interface Splash {
  x: number;
  r: number;
  alpha: number;
}

export interface FogBank {
  x: number;
  y: number;
  rw: number;
  rh: number;
  speed: number;
  alpha: number;
}

export interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  /** 来自共享贴图池 */
  sprite: HTMLCanvasElement;
  /** 绘制边长（贴图按此缩放） */
  drawSize: number;
}

export interface Hailstone {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  bounces: number;
  opacity: number;
  /** 帧延迟：>0 时不渲染，用于打散同时出现的批次感 */
  delay: number;
  gravity: number;
  phase: number;
  gust: number;
  maxBounces: number;
  /** 来自共享贴图池 */
  sprite: HTMLCanvasElement;
  /** 绘制边长（贴图按此缩放） */
  drawSize: number;
  rotation: number;
  rotationSpeed: number;
}

export interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  wave: number;
  alpha: number;
  width: number;
  /** 个体相位，用于与全局风场错开 */
  phase: number;
}

export interface MoonCrater {
  dx: number;
  dy: number;
  r: number;
}

/** 预渲染的日/月贴图，绘制时按 breath 轻微缩放 */
export interface CelestialSprite {
  canvas: HTMLCanvasElement;
  /** 贴图中心到边的半长 */
  half: number;
  breathSpeed: number;
  breathAmp: number;
}

/** 预渲染的雾团贴图（alpha=1 的柔边圆），绘制时按 bank 缩放并叠加透明度 */
export interface FogSprite {
  canvas: HTMLCanvasElement;
  baseR: number;
}

export interface SceneState {
  stars: Star[];
  moonCraters: MoonCrater[];
  clouds: Cloud[];
  drops: Drop[];
  splashes: Splash[];
  fogBanks: FogBank[];
  flakes: Flake[];
  hailstones: Hailstone[];
  /** 冰雹共享贴图池，落地回收时复用 */
  hailPool: HTMLCanvasElement[];
  windStreaks: WindStreak[];
  t: number;
  flashAlpha: number;
  boltLife: number;
  boltPoints: [number, number][];
  nextStrike: number;
}

export interface WeatherSceneParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  activeWeather: WeatherType;
  /** 由日弧推算的昼夜（内部更新） */
  activeNight: boolean;
  /** 当地日出日落；有则启用日弧 */
  dayCycleTimes?: DayCycleTimes | null;
  /** 场景时刻（ms）；live 模式下由动画循环用 Date.now() 覆盖 */
  sceneTimeMs: number;
  /** true = 每帧用当前时钟（live） */
  liveClock?: boolean;
  /** 风速驱动的运动参数 */
  windMotion: WindMotion;
  /** 雨量档 1~10；雨天时用于连续插值雨丝密度 */
  rainLevel?: number;
  /** 雪量档 1~10；雪天时用于连续插值雪花数量 */
  snowLevel?: number;
  /** 冰雹强度 1~3；冰雹天气时调节粒子数量与大小 */
  hailLevel?: number;
  /** 雾浓度 1~3；雾天时调节雾团与霾层 */
  fogLevel?: number;
  /** 霾强度 1~3；霾天时调节雾团与黄褐罩层 */
  smogLevel?: number;
}
