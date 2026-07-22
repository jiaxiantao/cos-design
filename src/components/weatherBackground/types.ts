export type WeatherType =
  | 'sunny'
  | 'partlyCloudy'
  | 'overcast'
  | 'lightRain'
  | 'moderateRain'
  | 'heavyRain'
  | 'thunderstorm'
  | 'fog'
  | 'lightSnow'
  | 'moderateSnow'
  | 'heavySnow'
  | 'sleet'
  | 'hail'
  | 'smog'
  | 'gale'
  /** @deprecated 请使用 moderateSnow */
  | 'snow';

export interface WeatherBackgroundProps {
  width?: number;
  height?: number;
  /** 天气类型：sunny 大晴天 / partlyCloudy 多云 / overcast 阴天 / lightRain 小雨 / moderateRain 中雨 / heavyRain 大雨 / thunderstorm 雷阵雨 / fog 雾 / lightSnow 小雪 / moderateSnow 中雪 / heavySnow 大雪 / sleet 雨夹雪 / hail 冰雹 / smog 霾 / gale 大风 */
  weather?: WeatherType;
  /** 夜间模式：渲染深夜天空、月亮与星空；live 模式下自动按当地实际日夜覆盖此值 */
  night?: boolean;
  /** 接入 Open-Meteo 实况：自动定位并按真实天气渲染，定位或请求失败时回退到 weather */
  live?: boolean;
  /** live 模式查询纬度（-90 ~ 90），与 longitude 同时配置时跳过浏览器定位 */
  latitude?: number;
  /** live 模式查询经度（-180 ~ 180），与 latitude 同时配置时跳过浏览器定位 */
  longitude?: number;
  /** live 模式解析出真实天气后回调 */
  onLiveWeather?: (weather: WeatherType) => void;
  /** 外部受控 loading：在当前画面上叠加加载遮罩（live 模式定位/请求期间会自动显示，无需传入） */
  loading?: boolean;
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
  sprite: HTMLCanvasElement;
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
  sprite: HTMLCanvasElement;
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
}

export interface MoonCrater {
  dx: number;
  dy: number;
  r: number;
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
  activeNight: boolean;
}
