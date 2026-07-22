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
    values: ['mapWmoCodeToWeatherType', 'useLiveWeather'],
    types: [
      'WeatherBackgroundProps',
      'WeatherType',
      'LiveWeatherCoords',
      'LiveWeatherState',
      'LiveWeatherStatus',
      'OpenMeteoCurrent'
    ],
    from: {
      mapWmoCodeToWeatherType: './live-weather',
      useLiveWeather: './live-weather',
      LiveWeatherCoords: './live-weather',
      LiveWeatherState: './live-weather',
      LiveWeatherStatus: './live-weather',
      OpenMeteoCurrent: './live-weather'
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
  const entry = join(COMPONENTS_DIR, name, 'index.tsx');
  if (!existsSync(entry)) return false;
  const source = readFileSync(entry, 'utf8');
  return (
    source.includes("@cos-design/shared") ||
    source.includes("../_shared/visibility") ||
    source.includes("../_shared")
  );
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
