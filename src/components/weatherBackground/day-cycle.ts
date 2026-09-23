/** 昼夜太阳/月亮位置与天空色温 —— 按真实日出日落推进 */

export type RGB = [number, number, number];

export interface DayCycleTimes {
  /** 当日日出（本地时间戳 ms） */
  sunrise: number;
  /** 当日日落（本地时间戳 ms） */
  sunset: number;
}

export interface DayCycleState {
  /** 太阳是否在地平线之上 */
  isDay: boolean;
  /**
   * 当前天体沿东→西弧的进度 0~1。
   * 白天：日出→日落；夜晚：日落→次日日出。
   */
  arcProgress: number;
  /** 高度代理 0~1（地平线→天顶） */
  elevation: number;
  /**
   * 晨昏余晖强度 0~1：靠近日出/日落越高，深夜为 0。
   * 用于天空暖色与星空淡入。
   */
  twilight: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const parseHexRgb = (hex: string): RGB => {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (full.length !== 6) return [80, 140, 200];
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [80, 140, 200];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = ([r, g, b]: RGB): string => {
  const h = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpRgb = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

const mixHex = (a: string, b: string, t: number) =>
  rgbToHex(lerpRgb(parseHexRgb(a), parseHexRgb(b), clamp01(t)));

const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** 无日出日落数据时的本地近似（6:00 / 18:00） */
export const approximateDayCycleTimes = (now = Date.now()): DayCycleTimes => {
  const d = new Date(now);
  const sunrise = new Date(d);
  sunrise.setHours(6, 0, 0, 0);
  const sunset = new Date(d);
  sunset.setHours(18, 0, 0, 0);
  return { sunrise: sunrise.getTime(), sunset: sunset.getTime() };
};

/** 默认演示时刻：下午 14:00；夜间示例可用 02:00 */
export const DEFAULT_SCENE_TIME = '14:00';

/** 将 `HH:mm` 解析为「今天」本地时间戳；非法格式返回 null */
export const parseTimeString = (time: string, base = new Date()): number | null => {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
};

/** 解析时刻，失败时回退默认 14:00 */
export const resolveSceneTimeMs = (time: string | undefined, base = new Date()): number =>
  parseTimeString(time ?? DEFAULT_SCENE_TIME, base) ?? parseTimeString(DEFAULT_SCENE_TIME, base)!;

/**
 * 根据当前时刻与日出日落计算日弧进度。
 * 若 now 在日落之后，夜晚弧延伸到「次日日出」= 今日日出 + 24h（近似）。
 */
export const computeDayCycle = (nowMs: number, times: DayCycleTimes): DayCycleState => {
  let { sunrise, sunset } = times;
  if (!(sunset > sunrise)) {
    const approx = approximateDayCycleTimes(nowMs);
    sunrise = approx.sunrise;
    sunset = approx.sunset;
  }

  const dayLen = Math.max(1, sunset - sunrise);
  const nextSunrise = sunrise + 24 * 60 * 60 * 1000;
  const prevSunset = sunset - 24 * 60 * 60 * 1000;

  const isDay = nowMs >= sunrise && nowMs < sunset;

  let arcProgress: number;
  if (isDay) {
    arcProgress = clamp01((nowMs - sunrise) / dayLen);
  } else if (nowMs >= sunset) {
    // 今晚：日落 → 次日日出
    const nightLen = Math.max(1, nextSunrise - sunset);
    arcProgress = clamp01((nowMs - sunset) / nightLen);
  } else {
    // 今早日出前：昨夜日落 → 今日日出
    const nightLen = Math.max(1, sunrise - prevSunset);
    arcProgress = clamp01((nowMs - prevSunset) / nightLen);
  }

  const elevation = isDay ? Math.sin(Math.PI * arcProgress) : 0;

  // 晨昏：日出/日落前后约 75 分钟内余晖增强
  const twilightWindow = 75 * 60 * 1000;
  const distSunrise = Math.abs(nowMs - sunrise);
  const distSunset = Math.abs(nowMs - sunset);
  const twilight = clamp01(1 - Math.min(distSunrise, distSunset) / twilightWindow);

  return { isDay, arcProgress, elevation, twilight };
};

/** 东升西落弧：左侧东 → 右侧西，中间最高 */
export const celestialScreenPosition = (
  width: number,
  height: number,
  arcProgress: number,
): { x: number; y: number } => {
  const t = clamp01(arcProgress);
  const elev = Math.sin(Math.PI * t);
  return {
    x: width * (0.1 + 0.8 * t),
    y: height * (0.58 - 0.4 * elev),
  };
};

/** 晨昏暖色（相对天气日间天空做混合） */
const WARM_TOP = '#e8895c';
const WARM_BOTTOM = '#f3c98a';
const DUSK_TOP = '#2a1f4a';
const DUSK_BOTTOM = '#c4784a';

/**
 * 按日周期混合天气日/夜天空色。
 * daySky / nightSky 来自 CONFIGS / NIGHT_CONFIGS。
 */
export const resolveSkyByDayCycle = (
  daySky: [string, string],
  nightSky: [string, string],
  cycle: DayCycleState,
): [string, string] => {
  if (cycle.isDay) {
    // 地平线附近偏暖、略暗；天顶用天气日间色
    const zenith = smoothstep(cycle.elevation);
    const warmAmt = (1 - zenith) * 0.72;
    const top = mixHex(mixHex(daySky[0], WARM_TOP, warmAmt), '#1a2438', (1 - zenith) * 0.12);
    const bottom = mixHex(
      mixHex(daySky[1], WARM_BOTTOM, warmAmt * 0.85),
      '#3a4558',
      (1 - zenith) * 0.08,
    );
    return [top, bottom];
  }

  // 夜间：深夜用夜空，靠近日出/日落掺入余晖
  const glow = cycle.twilight;
  const top = mixHex(nightSky[0], mixHex(DUSK_TOP, WARM_TOP, 0.35), glow * 0.55);
  const bottom = mixHex(nightSky[1], mixHex(DUSK_BOTTOM, WARM_BOTTOM, 0.4), glow * 0.7);
  return [top, bottom];
};

export const buildSkyGradient = (
  ctx: CanvasRenderingContext2D,
  height: number,
  sky: [string, string],
): CanvasGradient => {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, sky[0]);
  g.addColorStop(1, sky[1]);
  return g;
};

/** 近地平线时天体略收小、略淡 */
export const celestialDrawScale = (cycle: DayCycleState): { scale: number; alpha: number } => {
  if (!cycle.isDay) {
    return { scale: 0.92 + cycle.twilight * 0.06, alpha: 0.75 + cycle.twilight * 0.2 };
  }
  const e = cycle.elevation;
  return {
    scale: 0.82 + e * 0.22,
    alpha: 0.65 + e * 0.35,
  };
};
