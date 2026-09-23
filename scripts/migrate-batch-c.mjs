#!/usr/bin/env node
/**
 * Migrate Batch C (WebGL / Three.js / complex) components to v4 structure.
 * Core engines are hand-written under src/components/<name>/core/.
 * This script converts LESS → CSS, writes adapters, customizes element parse, and re-exports index.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toExportName } from './component-packages.mjs';
import { convertComponentLessToCss } from './convert-less-to-css.mjs';
import { writeV4Adapters } from './write-v4-adapters.mjs';
import { toElementTag } from './v4-utils.mjs';

export const BATCH_C = [
  'lavaBubble',
  'liquidProgress',
  'metaballPool',
  'photoLantern',
  'photoPrism',
  'photoTunnel',
  'plasmaBall',
  'rippleWater',
  'soapBubbles',
  'solarSystem',
  'dnaHelix',
  'orbitalChart',
  'photoClothesline',
  'photoViewMaster',
  'weatherBackground'
];

const NUM = (attr, key = attr) =>
  `  if (el.hasAttribute('${attr}')) options.${key} = Number(el.getAttribute('${attr}'));`;
const STR = (attr, key = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase())) =>
  `  if (el.hasAttribute('${attr}')) options.${key} = el.getAttribute('${attr}') ?? undefined;`;
const BOOL = (attr, key = attr) =>
  `  if (el.hasAttribute('${attr}')) options.${key} = el.getAttribute('${attr}') !== 'false';`;
const FILL = `  if (el.hasAttribute('fill')) options.fill = true;`;

const ELEMENT = {
  dnaHelix: {
    parse: [NUM('width'), NUM('height'), NUM('speed'), STR('color')].join('\n'),
    observed: ['width', 'height', 'speed', 'color']
  },
  liquidProgress: {
    parse: [NUM('value'), NUM('max'), NUM('size'), STR('color')].join('\n'),
    observed: ['value', 'max', 'size', 'color']
  },
  orbitalChart: {
    parse: [NUM('size')].join('\n'),
    observed: ['size']
  },
  solarSystem: {
    parse: [NUM('width'), NUM('height'), NUM('speed'), BOOL('show-orbits', 'showOrbits')].join('\n'),
    observed: ['width', 'height', 'speed', 'show-orbits']
  },
  plasmaBall: {
    parse: [NUM('width'), NUM('height'), STR('color'), NUM('arc-count', 'arcCount')].join('\n'),
    observed: ['width', 'height', 'color', 'arc-count']
  },
  metaballPool: {
    parse: [NUM('width'), NUM('height'), NUM('ball-count', 'ballCount'), STR('color')].join('\n'),
    observed: ['width', 'height', 'ball-count', 'color']
  },
  lavaBubble: {
    parse: [
      NUM('width'),
      NUM('height'),
      FILL,
      NUM('heat'),
      NUM('speed'),
      BOOL('auto-spawn', 'autoSpawn'),
      NUM('activity'),
      BOOL('interactive'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: ['width', 'height', 'fill', 'heat', 'speed', 'auto-spawn', 'activity', 'interactive', 'aria-label']
  },
  rippleWater: {
    parse: [
      NUM('width'),
      NUM('height'),
      FILL,
      STR('from-color', 'fromColor'),
      STR('to-color', 'toColor'),
      STR('color'),
      NUM('wave-amplitude', 'waveAmplitude'),
      NUM('wave-speed', 'waveSpeed'),
      NUM('shimmer'),
      NUM('reflection'),
      NUM('ripple-strength', 'rippleStrength'),
      NUM('ripple-radius', 'rippleRadius'),
      NUM('damping'),
      NUM('spread'),
      BOOL('interactive'),
      BOOL('show-hint', 'showHint'),
      STR('hint')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'fill',
      'from-color',
      'to-color',
      'color',
      'wave-amplitude',
      'wave-speed',
      'shimmer',
      'reflection',
      'ripple-strength',
      'ripple-radius',
      'damping',
      'spread',
      'interactive',
      'show-hint',
      'hint'
    ]
  },
  soapBubbles: {
    parse: [
      NUM('width'),
      NUM('height'),
      FILL,
      NUM('count'),
      NUM('speed'),
      BOOL('interactive'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: ['width', 'height', 'fill', 'count', 'speed', 'interactive', 'aria-label']
  },
  weatherBackground: {
    parse: [
      NUM('width'),
      NUM('height'),
      FILL,
      `  if (el.hasAttribute('weather')) options.weather = (el.getAttribute('weather') ?? undefined) as WeatherBackgroundOptions['weather'];`,
      STR('time'),
      BOOL('live'),
      NUM('latitude'),
      NUM('longitude'),
      NUM('wind-level', 'windLevel'),
      NUM('rain-level', 'rainLevel'),
      NUM('snow-level', 'snowLevel'),
      NUM('hail-level', 'hailLevel'),
      NUM('fog-level', 'fogLevel'),
      NUM('smog-level', 'smogLevel'),
      BOOL('loading'),
      STR('aria-label', 'ariaLabel'),
      STR('loading-text', 'loadingText')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'fill',
      'weather',
      'time',
      'live',
      'latitude',
      'longitude',
      'wind-level',
      'rain-level',
      'snow-level',
      'hail-level',
      'fog-level',
      'smog-level',
      'loading',
      'aria-label',
      'loading-text'
    ]
  },
  photoLantern: {
    parse: [
      NUM('width'),
      NUM('height'),
      BOOL('auto-rotate', 'autoRotate'),
      NUM('auto-rotate-speed', 'autoRotateSpeed'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('friction'),
      STR('frame-color', 'frameColor'),
      STR('paper-color', 'paperColor'),
      STR('light-color', 'lightColor'),
      STR('background'),
      NUM('light-sway', 'lightSway'),
      BOOL('show-accessories', 'showAccessories'),
      STR('tassel-color', 'tasselColor'),
      STR('object-fit', 'objectFit'),
      BOOL('silhouette'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-angle', 'initialAngle'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'auto-rotate',
      'auto-rotate-speed',
      'drag-sensitivity',
      'friction',
      'frame-color',
      'paper-color',
      'light-color',
      'background',
      'light-sway',
      'show-accessories',
      'tassel-color',
      'object-fit',
      'silhouette',
      'show-caption',
      'initial-angle',
      'aria-label'
    ]
  },
  photoPrism: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('size'),
      BOOL('auto-rotate', 'autoRotate'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('friction'),
      BOOL('show-caption', 'showCaption'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: ['width', 'height', 'size', 'auto-rotate', 'drag-sensitivity', 'friction', 'show-caption', 'aria-label']
  },
  photoTunnel: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('depth-step', 'depthStep'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('friction'),
      BOOL('auto-advance', 'autoAdvance'),
      NUM('auto-advance-speed', 'autoAdvanceSpeed'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'depth-step',
      'drag-sensitivity',
      'friction',
      'auto-advance',
      'auto-advance-speed',
      'show-caption',
      'initial-index',
      'aria-label'
    ]
  },
  photoClothesline: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('photo-width', 'photoWidth'),
      NUM('photo-height', 'photoHeight'),
      NUM('photo-gap', 'photoGap'),
      NUM('rope-top', 'ropeTop'),
      NUM('rope-sag', 'ropeSag'),
      NUM('band-length', 'bandLength'),
      NUM('band-width', 'bandWidth'),
      NUM('max-pull', 'maxPull'),
      NUM('stiffness'),
      NUM('damping'),
      NUM('tension'),
      NUM('tilt'),
      STR('rope-color', 'ropeColor'),
      STR('band-color', 'bandColor'),
      STR('pin-color', 'pinColor'),
      STR('frame-color', 'frameColor'),
      STR('background'),
      STR('object-fit', 'objectFit'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'photo-width',
      'photo-height',
      'photo-gap',
      'rope-top',
      'rope-sag',
      'band-length',
      'band-width',
      'max-pull',
      'stiffness',
      'damping',
      'tension',
      'tilt',
      'rope-color',
      'band-color',
      'pin-color',
      'frame-color',
      'background',
      'object-fit',
      'show-caption',
      'initial-index',
      'aria-label'
    ]
  },
  photoViewMaster: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('disc-size', 'discSize'),
      NUM('peep-size', 'peepSize'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('friction'),
      BOOL('auto-rotate', 'autoRotate'),
      NUM('auto-rotate-speed', 'autoRotateSpeed'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'disc-size',
      'peep-size',
      'drag-sensitivity',
      'friction',
      'auto-rotate',
      'auto-rotate-speed',
      'show-caption',
      'initial-index',
      'aria-label'
    ]
  }
};

function writeElement(name, exportName, parseBody, observed = []) {
  const tag = toElementTag(name);
  writeFileSync(
    join(COMPONENTS_DIR, name, 'element', 'index.ts'),
    `import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

const TAG = '${tag}';

function parseOptions(el: HTMLElement): ${exportName}Options {
  const options = {} as ${exportName}Options;
${parseBody}
  return options;
}

class Cos${exportName}Element extends HTMLElement {
  private ctrl: ${exportName}Controller | null = null;

  static get observedAttributes() {
    return ${JSON.stringify(observed)};
  }

  connectedCallback() {
    this.ctrl = create${exportName}(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, Cos${exportName}Element);
}

export { Cos${exportName}Element, TAG };
`
  );
}

async function main() {
  for (const name of BATCH_C) {
    const coreIndex = join(COMPONENTS_DIR, name, 'core', 'index.ts');
    if (!existsSync(coreIndex)) {
      console.error(`Missing core engine for ${name} — write core/index.ts first`);
      process.exit(1);
    }

    for (const sub of ['core', 'react', 'vue', 'element', 'style']) {
      mkdirSync(join(COMPONENTS_DIR, name, sub), { recursive: true });
    }

    const exportName = toExportName(name);
    console.log(`Adapting ${name}...`);

    const css = await convertComponentLessToCss(name);
    writeFileSync(join(COMPONENTS_DIR, name, 'style', 'index.css'), css);

    writeV4Adapters(name, exportName);

    const el = ELEMENT[name];
    writeElement(name, exportName, el?.parse ?? '', el?.observed ?? []);

    writeFileSync(
      join(COMPONENTS_DIR, name, 'index.tsx'),
      `export { default } from './react';
export { default as ${exportName} } from './react';
export type * from './core/types';
`
    );

    if (name === 'weatherBackground') {
      patchWeatherBackgroundExports();
    }
  }
  console.log(`Done: processed ${BATCH_C.length} Batch C components.`);
}

function patchWeatherBackgroundExports() {
  const liveReexport = `export { formatLocalHm, mapWmoCodeToWeatherType, useLiveWeather, useSunTimes } from '../live-weather';
export type { LiveWeatherCoords, LiveWeatherState, LiveWeatherStatus, OpenMeteoCurrent } from '../live-weather';
`;
  const reactPath = join(COMPONENTS_DIR, 'weatherBackground', 'react', 'index.tsx');
  const reactSrc = readFileSync(reactPath, 'utf8');
  if (!reactSrc.includes('useLiveWeather')) {
    writeFileSync(
      reactPath,
      reactSrc.replace(
        "export type { WeatherBackgroundOptions, WeatherBackgroundProps } from '../core/types';\n",
        `export type { WeatherBackgroundOptions, WeatherBackgroundProps } from '../core/types';\n${liveReexport}`
      )
    );
  }

  writeFileSync(
    join(COMPONENTS_DIR, 'weatherBackground', 'index.tsx'),
    `export { default } from './react';
export { default as WeatherBackground } from './react';
export type * from './core/types';
export { formatLocalHm, mapWmoCodeToWeatherType, useLiveWeather, useSunTimes } from './live-weather';
export type { LiveWeatherCoords, LiveWeatherState, LiveWeatherStatus, OpenMeteoCurrent } from './live-weather';
`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
