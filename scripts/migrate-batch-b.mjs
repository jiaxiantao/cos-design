#!/usr/bin/env node
/**
 * Migrate Batch B (Canvas 2D + DOM) components to v4 structure.
 * Fireworks is already migrated — skipped.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toExportName, toPackageId } from './component-packages.mjs';
import { convertComponentLessToCss } from './convert-less-to-css.mjs';
import { writeV4Adapters } from './write-v4-adapters.mjs';
import { toElementTag } from './v4-utils.mjs';
import { BATCH_B_DEFS } from './batch-b/defs.mjs';

const BATCH_B = [
  'audioVisualizer', 'aurora', 'auroraVeil', 'bubbleField', 'canvasClock', 'clickSpark', 'confetti',
  'cursorTrail', 'cyberGrid', 'dandelionField', 'diceRoll', 'electricArc', 'flipCounter', 'gameOfLife',
  'gravityBalls', 'inkBloom', 'matrixRain', 'mazeGenerator', 'meteorRain', 'networkGraph',
  'particleNetwork', 'radarScan', 'redPacketRain', 'returnCity', 'ropeChain', 'sandFall', 'smokeFog',
  'snowfall', 'starfield', 'progressChest', 'countUp', 'countdown', 'flipCard', 'speedometer'
];

const SLOT_COMPONENTS = new Set(['clickSpark']);

function writeCore(name, typesSrc, engineSrc, exposeMethods = []) {
  const dir = join(COMPONENTS_DIR, name);
  for (const sub of ['core', 'react', 'vue', 'element', 'style']) {
    mkdirSync(join(dir, sub), { recursive: true });
  }
  const exportName = toExportName(name);
  const handleExport = exposeMethods.length ? `, ${exportName}Handle` : '';
  writeFileSync(join(dir, 'core', 'types.ts'), typesSrc.trim() + '\n');
  writeFileSync(join(dir, 'core', 'engine.ts'), engineSrc.trim() + '\n');
  writeFileSync(
    join(dir, 'core', 'index.ts'),
    `export { create${exportName} } from './engine';
export type { ${exportName}Controller, ${exportName}Options, ${exportName}Props${handleExport} } from './types';
`
  );
}

function writeSlotReact(name, exportName) {
  writeFileSync(
    join(COMPONENTS_DIR, name, 'react', 'index.tsx'),
    `import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

export type { ${exportName}Options, ${exportName}Props } from '../core/types';

type SlotProps = ${exportName}Options & { children?: React.ReactNode };

const ${exportName} = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${exportName}Controller | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    const slot = slotRef.current;
    if (!host || !slot) return;
    const ctrl = create${exportName}(host, { ...propsRef.current, slotElement: slot });
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    ctrlRef.current?.update({ ...props, slotElement: slot });
  }, [props]);

  return (
    <div ref={hostRef} className="cos-${name}-host">
      <div ref={slotRef} style={{ display: 'contents' }}>{children}</div>
    </div>
  );
});

${exportName}.displayName = '${exportName}';

export default ${exportName};
`
  );
}

function writeImperativeReact(name, exportName, exposeMethods, handleType = exportName) {
  const exposeLines = exposeMethods
    .map((m) => {
      if (m.includes(':')) return m;
      return `    ${m}: (...args: unknown[]) => (ctrlRef.current as ${handleType}Controller | null)?.${m}(...args)`;
    })
    .join(',\n');

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
${exposeLines}
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

function writeElement(name, exportName, parseBody, observed = [], methods = '') {
  const tag = toElementTag(name);
  writeFileSync(
    join(COMPONENTS_DIR, name, 'element', 'index.ts'),
    `import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

const TAG = '${tag}';

function parseOptions(_el: HTMLElement): ${exportName}Options {
  const options: ${exportName}Options = {};
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

function copySiblingModules(name, files) {
  const coreDir = join(COMPONENTS_DIR, name, 'core');
  mkdirSync(coreDir, { recursive: true });
  for (const f of files) {
    const src = join(COMPONENTS_DIR, name, f);
    if (existsSync(src)) {
      cpSync(src, join(coreDir, f));
    }
  }
}

async function main() {
  for (const name of BATCH_B) {
    if (existsSync(join(COMPONENTS_DIR, name, 'core', 'index.ts'))) {
      console.log(`Skip ${name} (already migrated)`);
      continue;
    }

    const def = BATCH_B_DEFS[name];
    if (!def) {
      console.error(`Missing definition for ${name}`);
      process.exit(1);
    }

    const exportName = toExportName(name);
    console.log(`Migrating ${name}...`);

    if (def.copyModules?.length) {
      copySiblingModules(name, def.copyModules);
    }

    if (def.engineFile) {
      const engineSrc = readFileSync(join(import.meta.dirname, 'batch-b', 'engines', def.engineFile), 'utf8');
      writeCore(name, def.types, engineSrc, def.exposeMethods ?? []);
    } else {
      writeCore(name, def.types, def.engine, def.exposeMethods ?? []);
    }

    const css = await convertComponentLessToCss(name);
    writeFileSync(join(COMPONENTS_DIR, name, 'style', 'index.css'), css);

    const expose = def.exposeMethods ?? [];
    writeV4Adapters(name, exportName, { exposeMethods: expose.map((m) => m.split(':')[0].trim()) });

    if (SLOT_COMPONENTS.has(name)) {
      writeSlotReact(name, exportName);
    } else if (expose.length) {
      writeImperativeReact(name, exportName, expose);
    }

    writeElement(name, exportName, def.elementParse ?? '', def.observed ?? [], def.elementMethods ?? '');

    writeFileSync(
      join(COMPONENTS_DIR, name, 'index.tsx'),
      `export { default } from './react';
export { default as ${exportName} } from './react';
export type * from './core/types';
`
    );
  }
  console.log(`Done: processed ${BATCH_B.length} Batch B components.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
