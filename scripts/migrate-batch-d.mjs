#!/usr/bin/env node
/**
 * Migrate Batch D (composite DOM + state machine / physics) components to v4.
 * Core engines are hand-written under src/components/<name>/core/.
 * This script converts LESS → CSS, writes adapters, customizes element parse, and re-exports index.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toExportName } from './component-packages.mjs';
import { convertComponentLessToCss } from './convert-less-to-css.mjs';
import { writeV4Adapters } from './write-v4-adapters.mjs';
import { toElementTag } from './v4-utils.mjs';

export const BATCH_D = [
  'turntable',
  'slotMachine',
  'nineGrid',
  'scratchCard',
  'photoAlbum',
  'photoCarousel',
  'photoFilmstrip',
  'photoFridge',
  'photoLightbox',
  'photoPolaroid',
  'photoPostcard',
  'photoScroll',
  'newtonCradle',
  'doublePendulum',
  'springMass',
  'lorenzAttractor'
];

const NUM = (attr, key = attr) =>
  `  if (el.hasAttribute('${attr}')) options.${key} = Number(el.getAttribute('${attr}'));`;
const STR = (attr, key = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase())) =>
  `  if (el.hasAttribute('${attr}')) options.${key} = el.getAttribute('${attr}') ?? undefined;`;
const BOOL = (attr, key = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase())) =>
  `  if (el.hasAttribute('${attr}')) options.${key} = el.getAttribute('${attr}') !== 'false';`;
const JSONA = (attr, key = attr) =>
  `  if (el.hasAttribute('${attr}')) {
    try {
      options.${key} = JSON.parse(el.getAttribute('${attr}') ?? 'null');
    } catch {
      /* ignore invalid JSON */
    }
  }`;

const HANDLE = {
  turntable: {
    methods: ['spin', 'reset'],
    react: `    spin: (targetIndex?: number) => ctrlRef.current?.spin(targetIndex),
    reset: () => ctrlRef.current?.reset()`,
    vue: `  spin: (targetIndex?: number) => ctrl?.spin(targetIndex),
  reset: () => ctrl?.reset()`,
    element: `
  spin(targetIndex?: number) {
    this.ctrl?.spin(targetIndex);
  }

  reset() {
    this.ctrl?.reset();
  }`
  },
  slotMachine: {
    methods: ['spin', 'reset'],
    react: `    spin: (results?: string[]) => ctrlRef.current?.spin(results),
    reset: () => ctrlRef.current?.reset()`,
    vue: `  spin: (results?: string[]) => ctrl?.spin(results),
  reset: () => ctrl?.reset()`,
    element: `
  spin(results?: string[]) {
    this.ctrl?.spin(results);
  }

  reset() {
    this.ctrl?.reset();
  }`
  },
  nineGrid: {
    methods: ['draw', 'reset'],
    react: `    draw: (targetIndex?: number) => ctrlRef.current?.draw(targetIndex),
    reset: () => ctrlRef.current?.reset()`,
    vue: `  draw: (targetIndex?: number) => ctrl?.draw(targetIndex),
  reset: () => ctrl?.reset()`,
    element: `
  draw(targetIndex?: number) {
    this.ctrl?.draw(targetIndex);
  }

  reset() {
    this.ctrl?.reset();
  }`
  },
  scratchCard: {
    methods: ['reset', 'reveal'],
    react: `    reset: () => ctrlRef.current?.reset(),
    reveal: () => ctrlRef.current?.reveal()`,
    vue: `  reset: () => ctrl?.reset(),
  reveal: () => ctrl?.reveal()`,
    element: `
  reset() {
    this.ctrl?.reset();
  }

  reveal() {
    this.ctrl?.reveal();
  }`
  }
};

const ELEMENT = {
  turntable: {
    parse: [
      JSONA('prizes'),
      NUM('size'),
      NUM('spin-duration', 'spinDuration'),
      NUM('spin-rounds', 'spinRounds'),
      NUM('target-index', 'targetIndex'),
      STR('button-text', 'buttonText'),
      STR('spinning-text', 'spinningText'),
      STR('result-prefix', 'resultPrefix')
    ].join('\n'),
    observed: [
      'prizes',
      'size',
      'spin-duration',
      'spin-rounds',
      'target-index',
      'button-text',
      'spinning-text',
      'result-prefix'
    ]
  },
  slotMachine: {
    parse: [
      JSONA('symbols'),
      NUM('spin-duration', 'spinDuration'),
      JSONA('target-results', 'targetResults'),
      STR('start-text', 'startText'),
      STR('button-text', 'buttonText'),
      STR('spinning-text', 'spinningText'),
      STR('jackpot-text', 'jackpotText'),
      STR('result-prefix', 'resultPrefix')
    ].join('\n'),
    observed: [
      'symbols',
      'spin-duration',
      'target-results',
      'start-text',
      'button-text',
      'spinning-text',
      'jackpot-text',
      'result-prefix'
    ]
  },
  nineGrid: {
    parse: [
      JSONA('items'),
      NUM('target-index', 'targetIndex'),
      STR('button-text', 'buttonText'),
      STR('spinning-text', 'spinningText'),
      BOOL('disabled')
    ].join('\n'),
    observed: ['items', 'target-index', 'button-text', 'spinning-text', 'disabled']
  },
  scratchCard: {
    parse: [
      STR('cover-color', 'coverColor'),
      STR('prize'),
      STR('cover-text', 'coverText'),
      NUM('reveal-threshold', 'revealThreshold'),
      NUM('width'),
      NUM('height')
    ].join('\n'),
    observed: ['cover-color', 'prize', 'cover-text', 'reveal-threshold', 'width', 'height']
  },
  photoAlbum: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('initial-index', 'initialIndex'),
      NUM('page-turn-duration', 'pageTurnDuration'),
      STR('object-fit', 'objectFit'),
      BOOL('show-page-number', 'showPageNumber'),
      STR('page-color', 'pageColor'),
      STR('cover-color', 'coverColor'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'initial-index',
      'page-turn-duration',
      'object-fit',
      'show-page-number',
      'page-color',
      'cover-color',
      'aria-label'
    ]
  },
  photoCarousel: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('radius'),
      NUM('card-width', 'cardWidth'),
      NUM('card-height', 'cardHeight'),
      BOOL('auto-rotate', 'autoRotate'),
      NUM('auto-rotate-speed', 'autoRotateSpeed'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('friction'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-angle', 'initialAngle'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'radius',
      'card-width',
      'card-height',
      'auto-rotate',
      'auto-rotate-speed',
      'drag-sensitivity',
      'friction',
      'show-caption',
      'initial-angle',
      'aria-label'
    ]
  },
  photoFilmstrip: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('frame-width', 'frameWidth'),
      NUM('frame-height', 'frameHeight'),
      NUM('frame-gap', 'frameGap'),
      BOOL('show-caption', 'showCaption'),
      NUM('friction'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'frame-width',
      'frame-height',
      'frame-gap',
      'show-caption',
      'friction',
      'drag-sensitivity',
      'initial-index',
      'aria-label'
    ]
  },
  photoFridge: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('card-width', 'cardWidth'),
      NUM('card-height', 'cardHeight'),
      NUM('scatter'),
      NUM('friction'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'card-width',
      'card-height',
      'scatter',
      'friction',
      'show-caption',
      'initial-index',
      'aria-label'
    ]
  },
  photoLightbox: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('slide-width', 'slideWidth'),
      NUM('slide-height', 'slideHeight'),
      NUM('pull-threshold', 'pullThreshold'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'slide-width',
      'slide-height',
      'pull-threshold',
      'show-caption',
      'initial-index',
      'aria-label'
    ]
  },
  photoPolaroid: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('card-width', 'cardWidth'),
      NUM('card-height', 'cardHeight'),
      NUM('scatter'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: ['width', 'height', 'card-width', 'card-height', 'scatter', 'show-caption', 'initial-index', 'aria-label']
  },
  photoPostcard: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('card-width', 'cardWidth'),
      NUM('card-height', 'cardHeight'),
      NUM('pull-threshold', 'pullThreshold'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      BOOL('initial-flipped', 'initialFlipped'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'card-width',
      'card-height',
      'pull-threshold',
      'show-caption',
      'initial-index',
      'initial-flipped',
      'aria-label'
    ]
  },
  photoScroll: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('frame-width', 'frameWidth'),
      NUM('frame-height', 'frameHeight'),
      NUM('frame-gap', 'frameGap'),
      NUM('drag-sensitivity', 'dragSensitivity'),
      NUM('friction'),
      BOOL('show-caption', 'showCaption'),
      NUM('initial-index', 'initialIndex'),
      STR('aria-label', 'ariaLabel')
    ].join('\n'),
    observed: [
      'width',
      'height',
      'frame-width',
      'frame-height',
      'frame-gap',
      'drag-sensitivity',
      'friction',
      'show-caption',
      'initial-index',
      'aria-label'
    ]
  },
  newtonCradle: {
    parse: [NUM('ball-count', 'ballCount'), STR('color'), NUM('width'), NUM('height')].join('\n'),
    observed: ['ball-count', 'color', 'width', 'height']
  },
  doublePendulum: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('trail-length', 'trailLength'),
      STR('color'),
      STR('color2')
    ].join('\n'),
    observed: ['width', 'height', 'trail-length', 'color', 'color2']
  },
  springMass: {
    parse: [
      NUM('width'),
      NUM('height'),
      NUM('cols'),
      NUM('rows'),
      NUM('stiffness'),
      NUM('damping'),
      STR('color'),
      STR('hint')
    ].join('\n'),
    observed: ['width', 'height', 'cols', 'rows', 'stiffness', 'damping', 'color', 'hint']
  },
  lorenzAttractor: {
    parse: [NUM('width'), NUM('height'), NUM('speed'), STR('color'), NUM('point-count', 'pointCount')].join('\n'),
    observed: ['width', 'height', 'speed', 'color', 'point-count']
  }
};

function writeImperativeReact(name, exportName, exposeBlock) {
  writeFileSync(
    join(COMPONENTS_DIR, name, 'react', 'index.tsx'),
    `import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Handle, type ${exportName}Options } from '../core';
import '../style/index.css';

export type { ${exportName}Handle, ${exportName}Options, ${exportName}Props } from '../core/types';

const ${exportName} = forwardRef<${exportName}Handle, ${exportName}Options>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${exportName}Controller | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
${exposeBlock}
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = create${exportName}(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-${name}-host" />;
});

${exportName}.displayName = '${exportName}';

export default ${exportName};
`
  );
}

function writeImperativeVue(name, exportName, exposeBlock) {
  writeFileSync(
    join(COMPONENTS_DIR, name, 'vue', `${exportName}.vue`),
    `<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

const props = defineProps<${exportName}Options>();
const emit = defineEmits<{}>();
const hostRef = ref<HTMLElement>();
let ctrl: ${exportName}Controller | null = null;

const toOptions = (): ${exportName}Options => ({ ...props });

onMounted(() => {
  if (hostRef.value) ctrl = create${exportName}(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

defineExpose({
${exposeBlock}
});
</script>

<template>
  <div ref="hostRef" class="cos-${name}-host" />
</template>
`
  );
}

function writeElement(name, exportName, parseBody, observed = [], methods = '') {
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
${methods}
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, Cos${exportName}Element);
}

export { Cos${exportName}Element, TAG };
`
  );
}

async function main() {
  for (const name of BATCH_D) {
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

    const handle = HANDLE[name];
    writeV4Adapters(name, exportName, { exposeMethods: handle?.methods ?? [] });

    if (handle) {
      writeImperativeReact(name, exportName, handle.react);
      writeImperativeVue(name, exportName, handle.vue);
    }

    const el = ELEMENT[name];
    writeElement(name, exportName, el?.parse ?? '', el?.observed ?? [], handle?.element ?? '');

    writeFileSync(
      join(COMPONENTS_DIR, name, 'index.tsx'),
      `export { default } from './react';
export { default as ${exportName} } from './react';
export type * from './core/types';
`
    );
  }
  console.log(`Done: processed ${BATCH_D.length} Batch D components.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
