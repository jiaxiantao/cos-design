import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..');
export const COMPONENTS_DIR = join(ROOT, 'src/components');
export const PACKAGES_DIR = join(ROOT, 'packages');

export const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

/** 组件额外具名导出（默认导出之外，需从包入口一并导出） */
export const EXTRA_EXPORTS = {
  weatherBackground: {
    values: [
      'formatLocalHm',
      'mapWmoCodeToWeatherType',
      'useLiveWeather',
      'useSunTimes',
      'DEFAULT_FOG_LEVEL',
      'FOG_LEVEL_LABELS',
      'clampFogLevel',
      'fogBankAlphaScale',
      'fogLevelFromVisibility',
      'fogLevelFromWmo',
      'formatFogLevel',
      'intensifyFogConfig',
      'supportsFogLevel',
      'DEFAULT_HAIL_LEVEL',
      'HAIL_LEVEL_LABELS',
      'clampHailLevel',
      'formatHailLevel',
      'hailLevelFromWmo',
      'hailSpec',
      'supportsHailLevel',
      'DEFAULT_SMOG_LEVEL',
      'SMOG_LEVEL_LABELS',
      'clampSmogLevel',
      'formatSmogLevel',
      'intensifySmogConfig',
      'smogBankAlphaScale',
      'smogLevelFromVisibility',
      'supportsSmogLevel',
      'DEFAULT_RAIN_LEVEL',
      'DEFAULT_SNOW_LEVEL',
      'MAX_PRECIP_LEVEL',
      'MIN_PRECIP_LEVEL',
      'RAIN_LEVEL_LABELS',
      'SNOW_LEVEL_LABELS',
      'clampPrecipLevel',
      'formatPrecipLevel',
      'intensifyRainConfig',
      'intensifySnowCount',
      'isRainWeather',
      'isSnowWeather',
      'normalizeWeatherType',
      'precipBand',
      'precipLabel',
      'rainLevelFromWeather',
      'rainLevelFromWmo',
      'resolveSceneWeather',
      'snowLevelFromWeather',
      'snowLevelFromWmo',
      'supportsRainLevel',
      'supportsSnowLevel',
      'DEFAULT_WIND_LEVEL',
      'buildWindMotion',
      'kmhToWindLevel',
      'sampleWindField',
      'visualWindLevel',
      'windLevelToKmh',
      'windStreakSpec'
    ],
    types: [
      'WeatherBackgroundProps',
      'WeatherType',
      'LiveWeatherCoords',
      'LiveWeatherState',
      'LiveWeatherStatus',
      'OpenMeteoCurrent',
      'FogLevel',
      'HailIntensitySpec',
      'HailLevel',
      'SmogLevel',
      'PrecipLevel',
      'WindFieldSample',
      'WindMotion'
    ],
    from: {
      formatLocalHm: './live-weather',
      mapWmoCodeToWeatherType: './live-weather',
      useLiveWeather: './live-weather',
      useSunTimes: './live-weather',
      LiveWeatherCoords: './live-weather',
      LiveWeatherState: './live-weather',
      LiveWeatherStatus: './live-weather',
      OpenMeteoCurrent: './live-weather',
      DEFAULT_FOG_LEVEL: './fog',
      FOG_LEVEL_LABELS: './fog',
      clampFogLevel: './fog',
      fogBankAlphaScale: './fog',
      fogLevelFromVisibility: './fog',
      fogLevelFromWmo: './fog',
      formatFogLevel: './fog',
      intensifyFogConfig: './fog',
      supportsFogLevel: './fog',
      FogLevel: './fog',
      DEFAULT_HAIL_LEVEL: './hail-level',
      HAIL_LEVEL_LABELS: './hail-level',
      clampHailLevel: './hail-level',
      formatHailLevel: './hail-level',
      hailLevelFromWmo: './hail-level',
      hailSpec: './hail-level',
      supportsHailLevel: './hail-level',
      HailIntensitySpec: './hail-level',
      HailLevel: './hail-level',
      DEFAULT_SMOG_LEVEL: './smog',
      SMOG_LEVEL_LABELS: './smog',
      clampSmogLevel: './smog',
      formatSmogLevel: './smog',
      intensifySmogConfig: './smog',
      smogBankAlphaScale: './smog',
      smogLevelFromVisibility: './smog',
      supportsSmogLevel: './smog',
      SmogLevel: './smog',
      DEFAULT_RAIN_LEVEL: './precipitation',
      DEFAULT_SNOW_LEVEL: './precipitation',
      MAX_PRECIP_LEVEL: './precipitation',
      MIN_PRECIP_LEVEL: './precipitation',
      RAIN_LEVEL_LABELS: './precipitation',
      SNOW_LEVEL_LABELS: './precipitation',
      clampPrecipLevel: './precipitation',
      formatPrecipLevel: './precipitation',
      intensifyRainConfig: './precipitation',
      intensifySnowCount: './precipitation',
      isRainWeather: './precipitation',
      isSnowWeather: './precipitation',
      normalizeWeatherType: './precipitation',
      precipBand: './precipitation',
      precipLabel: './precipitation',
      rainLevelFromWeather: './precipitation',
      rainLevelFromWmo: './precipitation',
      resolveSceneWeather: './precipitation',
      snowLevelFromWeather: './precipitation',
      snowLevelFromWmo: './precipitation',
      supportsRainLevel: './precipitation',
      supportsSnowLevel: './precipitation',
      PrecipLevel: './precipitation',
      DEFAULT_WIND_LEVEL: './wind',
      buildWindMotion: './wind',
      kmhToWindLevel: './wind',
      sampleWindField: './wind',
      visualWindLevel: './wind',
      windLevelToKmh: './wind',
      windStreakSpec: './wind',
      WindFieldSample: './wind',
      WindMotion: './wind'
    }
  },
  confetti: {
    values: [],
    types: ['ConfettiHandle', 'ConfettiProps']
  },
  fireworks: {
    values: [],
    types: ['FireworksHandle', 'FireworksProps']
  },
  orbitalChart: {
    values: [],
    types: ['OrbitalChartItem', 'OrbitalChartProps']
  },
  turntable: {
    values: [],
    types: ['TurntablePrize', 'TurntableProps']
  }
};

export function listComponentNames() {
  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && d.name !== 'index')
    .map((d) => d.name)
    .sort();
}

export function componentUsesShared(name) {
  const dir = join(COMPONENTS_DIR, name);
  if (!existsSync(dir)) return false;

  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;

      const source = readFileSync(fullPath, 'utf8');
      if (
        source.includes('@cos-design/shared') ||
        source.includes('../_shared/visibility') ||
        source.includes('../_shared')
      ) {
        return true;
      }
    }
  }

  return false;
}

/** 组件额外 peer 依赖（如 three） */
export function componentPeerDeps(name) {
  if (name === 'photoLantern') {
    return { three: '>=0.160.0' };
  }
  return null;
}

export function componentUsesThree(name) {
  return Boolean(componentPeerDeps(name));
}

export function toExportName(dirName) {
  return dirName.charAt(0).toUpperCase() + dirName.slice(1);
}

/** 目录名 camelCase → npm 包名段 kebab-case（npm 禁止新包名含大写字母） */
export function toPackageId(dirName) {
  return dirName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function packageNameOf(dirName) {
  return `@cos-design/${toPackageId(dirName)}`;
}
