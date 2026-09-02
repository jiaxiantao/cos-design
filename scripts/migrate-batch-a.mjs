#!/usr/bin/env node
/**
 * Migrate Batch A text/UI components to v4 structure.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toExportName } from './component-packages.mjs';
import { convertComponentLessToCss } from './convert-less-to-css.mjs';
import { writeV4Adapters } from './write-v4-adapters.mjs';
import { toElementTag } from './v4-utils.mjs';
import { toPackageId } from './component-packages.mjs';

const BATCH_A = [
  'blurText', 'burnAway', 'charge', 'circularText', 'curvedLoop', 'fuzzyText',
  'glitchText', 'gradientFlow', 'holographicCard', 'liquidGlass', 'magneticButton',
  'neonText', 'rotatingText', 'scrambleText', 'shinyText', 'splitReveal', 'splitText',
  'spotlight', 'textMorph', 'timelinePulse', 'trueFocus', 'typewriter', 'waveButton',
  'waveText', 'barcodeScan'
];

const SLOT_COMPONENTS = new Set(['liquidGlass', 'magneticButton', 'spotlight', 'barcodeScan']);

function p(name) {
  return `cos-${toPackageId(name)}`;
}

function writeCore(name, typesSrc, engineSrc, exposeMethods = []) {
  const dir = join(COMPONENTS_DIR, name);
  for (const sub of ['core', 'react', 'vue', 'element', 'style']) {
    mkdirSync(join(dir, sub), { recursive: true });
  }
  const exportName = toExportName(name);
  writeFileSync(join(dir, 'core', 'types.ts'), typesSrc.trim() + '\n');
  writeFileSync(join(dir, 'core', 'engine.ts'), engineSrc.trim() + '\n');
  writeFileSync(
    join(dir, 'core', 'index.ts'),
    `export { create${exportName} } from './engine';
export type { ${exportName}Controller, ${exportName}Options, ${exportName}Props${exposeMethods.length ? `, ${exportName}Handle` : ''} } from './types';
`
  );
}

function writeBurnAwayReact(name, exportName) {
  const dir = join(COMPONENTS_DIR, name);
  writeFileSync(
    join(dir, 'react', 'index.tsx'),
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
    ignite: () => ctrlRef.current?.ignite()
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

function writeSlotReact(name, exportName, extraProps = '') {
  const dir = join(COMPONENTS_DIR, name);
  writeFileSync(
    join(dir, 'react', 'index.tsx'),
    `import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

export type { ${exportName}Options, ${exportName}Props } from '../core/types';

type SlotProps = ${exportName}Options & { children?: React.ReactNode${extraProps} };

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

function writeWaveButtonReact(name, exportName) {
  const dir = join(COMPONENTS_DIR, name);
  writeFileSync(
    join(dir, 'react', 'index.tsx'),
    `import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { create${exportName}, type ${exportName}Controller, type ${exportName}Options } from '../core';
import '../style/index.css';

export type { ${exportName}Options, ${exportName}Props } from '../core/types';

type BtnProps = ${exportName}Options & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const ${exportName} = forwardRef<HTMLButtonElement, BtnProps>(({ text, color, className, style, ...rest }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${exportName}Controller | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const propsRef = useRef({ text, color, className, style, buttonProps: rest });
  propsRef.current = { text, color, className, style, buttonProps: rest };

  useImperativeHandle(ref, () => btnRef.current as HTMLButtonElement);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = create${exportName}(host, propsRef.current);
    btnRef.current = ctrl.getButton();
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
      btnRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
    btnRef.current = ctrlRef.current?.getButton() ?? null;
  }, [text, color, className, style, rest]);

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

function parseOptions(el: HTMLElement): ${exportName}Options {
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

function attrStr(key) {
  return `  if (el.hasAttribute('${key}')) options.${key} = el.getAttribute('${key}') ?? undefined;`;
}
function attrNum(key) {
  return `  if (el.hasAttribute('${key}')) options.${key} = Number(el.getAttribute('${key}'));`;
}
function attrBool(key) {
  return `  if (el.hasAttribute('${key}')) options.${key} = true;`;
}

// ─── Component definitions ───────────────────────────────────────────────

const COMPONENTS = {
  neonText: {
    exposeMethods: [],
    types: `export interface NeonTextOptions {
  text?: string;
  color?: string;
  fontSize?: number;
  flicker?: boolean;
}
export interface NeonTextController {
  update(options: Partial<NeonTextOptions>): void;
  destroy(): void;
}
export type NeonTextProps = NeonTextOptions;`,
    engine: `
import type { NeonTextController, NeonTextOptions } from './types';
const P = '${p('neonText')}';
export function createNeonText(container: HTMLElement, initial: NeonTextOptions = {}): NeonTextController {
  let opts: NeonTextOptions = { text: 'NEON', color: '#ff00de', fontSize: 72, flicker: true, ...initial };
  const root = document.createElement('div');
  root.className = P;
  const h1 = document.createElement('h1');
  h1.className = \`\${P}__text\`;
  const reflection = document.createElement('p');
  reflection.className = \`\${P}__reflection\`;
  root.append(h1, reflection);
  container.appendChild(root);
  const render = () => {
    h1.textContent = opts.text ?? 'NEON';
    h1.style.fontSize = \`\${opts.fontSize ?? 72}px\`;
    h1.style.setProperty('--neon-color', opts.color ?? '#ff00de');
    h1.classList.toggle(\`\${P}__flicker\`, opts.flicker ?? true);
    reflection.textContent = opts.text ?? 'NEON';
    reflection.style.fontSize = \`\${(opts.fontSize ?? 72) * 0.35}px\`;
    reflection.style.color = opts.color ?? '#ff00de';
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrStr('text')}\n${attrStr('color')}\n${attrNum('fontSize')}\n${attrBool('flicker')}`,
    observed: ['text', 'color', 'font-size', 'flicker']
  },

  glitchText: {
    types: `export interface GlitchTextOptions {
  text?: string;
  color?: string;
  glitchColor1?: string;
  glitchColor2?: string;
  fontSize?: number;
}
export interface GlitchTextController { update(o: Partial<GlitchTextOptions>): void; destroy(): void; }
export type GlitchTextProps = GlitchTextOptions;`,
    engine: `
import type { GlitchTextController, GlitchTextOptions } from './types';
const P = '${p('glitchText')}';
export function createGlitchText(container: HTMLElement, initial: GlitchTextOptions = {}): GlitchTextController {
  let opts: GlitchTextOptions = { text: 'GLITCH', color: '#f8fafc', glitchColor1: '#ff00de', glitchColor2: '#00f0ff', fontSize: 64, ...initial };
  const root = document.createElement('div'); root.className = P;
  const h1 = document.createElement('h1'); h1.className = \`\${P}__text\`;
  root.appendChild(h1); container.appendChild(root);
  const render = () => {
    const t = opts.text ?? 'GLITCH';
    h1.textContent = t; h1.setAttribute('data-text', t);
    h1.style.fontSize = \`\${opts.fontSize ?? 64}px\`;
    h1.style.setProperty('--glitch-color', opts.color ?? '#f8fafc');
    h1.style.setProperty('--glitch-c1', opts.glitchColor1 ?? '#ff00de');
    h1.style.setProperty('--glitch-c2', opts.glitchColor2 ?? '#00f0ff');
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrStr('text')}\n${attrStr('color')}\n${attrStr('glitch-color1')}\n${attrStr('glitch-color2')}\n${attrNum('fontSize')}`,
    observed: ['text', 'color', 'glitch-color1', 'glitch-color2', 'font-size']
  },

  gradientFlow: {
    types: `export interface GradientFlowOptions { text?: string; colors?: string[]; fontSize?: number; }
export interface GradientFlowController { update(o: Partial<GradientFlowOptions>): void; destroy(): void; }
export type GradientFlowProps = GradientFlowOptions;`,
    engine: `
import type { GradientFlowController, GradientFlowOptions } from './types';
const P = '${p('gradientFlow')}';
const DEFAULT_COLORS = ['#ff00de', '#7c3aed', '#00f0ff', '#38bdf8', '#ff00de'];
export function createGradientFlow(container: HTMLElement, initial: GradientFlowOptions = {}): GradientFlowController {
  let opts: GradientFlowOptions = { text: 'GRADIENT', colors: DEFAULT_COLORS, fontSize: 64, ...initial };
  const root = document.createElement('div'); root.className = P;
  const h1 = document.createElement('h1'); h1.className = \`\${P}__text\`;
  root.appendChild(h1); container.appendChild(root);
  const render = () => {
    const colors = (opts.colors?.length ?? 0) >= 2 ? opts.colors! : DEFAULT_COLORS;
    h1.textContent = opts.text ?? 'GRADIENT';
    h1.style.fontSize = \`\${opts.fontSize ?? 64}px\`;
    h1.style.backgroundImage = \`linear-gradient(90deg, \${colors.join(', ')})\`;
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrStr('text')}\n${attrNum('fontSize')}`,
    observed: ['text', 'font-size']
  },

  shinyText: {
    types: `export interface ShinyTextOptions { text?: string; speed?: number; color?: string; shineColor?: string; fontSize?: number; disabled?: boolean; }
export interface ShinyTextController { update(o: Partial<ShinyTextOptions>): void; destroy(): void; }
export type ShinyTextProps = ShinyTextOptions;`,
    engine: `
import type { ShinyTextController, ShinyTextOptions } from './types';
const P = '${p('shinyText')}';
export function createShinyText(container: HTMLElement, initial: ShinyTextOptions = {}): ShinyTextController {
  let opts: ShinyTextOptions = { text: 'SHINY TEXT', speed: 2, color: '#94a3b8', shineColor: '#ffffff', fontSize: 64, disabled: false, ...initial };
  const root = document.createElement('div'); root.className = P;
  const span = document.createElement('span'); span.className = \`\${P}__text\`;
  root.appendChild(span); container.appendChild(root);
  const render = () => {
    span.textContent = opts.text ?? 'SHINY TEXT';
    span.style.fontSize = \`\${opts.fontSize ?? 64}px\`;
    span.style.setProperty('--shiny-color', opts.color ?? '#94a3b8');
    span.style.setProperty('--shiny-shine', opts.shineColor ?? '#ffffff');
    span.style.setProperty('--shiny-duration', \`\${Math.max(opts.speed ?? 2, 0.4)}s\`);
    span.classList.toggle(\`\${P}__paused\`, opts.disabled ?? false);
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrStr('text')}\n${attrNum('speed')}\n${attrStr('color')}\n${attrStr('shine-color')}\n${attrNum('fontSize')}\n${attrBool('disabled')}`,
    observed: ['text', 'speed', 'color', 'shine-color', 'font-size', 'disabled']
  },

  waveText: {
    types: `export interface WaveTextOptions { text?: string; amplitude?: number; color?: string; fontSize?: number; }
export interface WaveTextController { update(o: Partial<WaveTextOptions>): void; destroy(): void; }
export type WaveTextProps = WaveTextOptions;`,
    engine: `
import type { WaveTextController, WaveTextOptions } from './types';
const P = '${p('waveText')}';
export function createWaveText(container: HTMLElement, initial: WaveTextOptions = {}): WaveTextController {
  let opts: WaveTextOptions = { text: 'WAVE', amplitude: 12, color: '#38bdf8', fontSize: 56, ...initial };
  const root = document.createElement('div'); root.className = P;
  const h1 = document.createElement('h1'); h1.className = \`\${P}__text\`;
  root.appendChild(h1); container.appendChild(root);
  const render = () => {
    h1.style.fontSize = \`\${opts.fontSize ?? 56}px\`;
    h1.style.setProperty('--wave-color', opts.color ?? '#38bdf8');
    h1.style.setProperty('--wave-amp', \`\${opts.amplitude ?? 12}px\`);
    h1.replaceChildren();
    for (const [i, char] of (opts.text ?? 'WAVE').split('').entries()) {
      const s = document.createElement('span');
      s.className = \`\${P}__char\`;
      s.style.animationDelay = \`\${i * 0.1}s\`;
      s.textContent = char === ' ' ? '\\u00A0' : char;
      h1.appendChild(s);
    }
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrStr('text')}\n${attrNum('amplitude')}\n${attrStr('color')}\n${attrNum('fontSize')}`,
    observed: ['text', 'amplitude', 'color', 'font-size']
  },

  splitReveal: {
    types: `export interface SplitRevealOptions { text?: string; delay?: number; color?: string; }
export interface SplitRevealController { update(o: Partial<SplitRevealOptions>): void; destroy(): void; }
export type SplitRevealProps = SplitRevealOptions;`,
    engine: `
import type { SplitRevealController, SplitRevealOptions } from './types';
const P = '${p('splitReveal')}';
const DIRECTIONS = ['fromTop', 'fromBottom', 'fromLeft', 'fromRight'] as const;
const dirClass = (d: string) => \`\${P}__\${d.replace(/([A-Z])/g, '-$1').toLowerCase()}\`;
export function createSplitReveal(container: HTMLElement, initial: SplitRevealOptions = {}): SplitRevealController {
  let opts: SplitRevealOptions = { text: 'REVEAL', delay: 80, color: '#f8fafc', ...initial };
  const root = document.createElement('div'); root.className = P;
  const h1 = document.createElement('h1'); h1.className = \`\${P}__text\`;
  root.appendChild(h1); container.appendChild(root);
  const render = () => {
    h1.style.setProperty('--reveal-color', opts.color ?? '#f8fafc');
    h1.replaceChildren();
    (opts.text ?? 'REVEAL').split('').forEach((char, i) => {
      const s = document.createElement('span');
      const dir = DIRECTIONS[i % DIRECTIONS.length];
      s.className = \`\${P}__char \${dirClass(dir)}\`;
      s.style.animationDelay = \`\${i * (opts.delay ?? 80)}ms\`;
      s.textContent = char === ' ' ? '\\u00A0' : char;
      h1.appendChild(s);
    });
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrStr('text')}\n${attrNum('delay')}\n${attrStr('color')}`,
    observed: ['text', 'delay', 'color']
  },

  timelinePulse: {
    types: `export interface TimelinePulseOptions { steps?: string[]; current?: number; color?: string; }
export interface TimelinePulseController { update(o: Partial<TimelinePulseOptions>): void; destroy(): void; }
export type TimelinePulseProps = TimelinePulseOptions;`,
    engine: `
import { clamp } from '@cos-design/shared';
import type { TimelinePulseController, TimelinePulseOptions } from './types';
const P = '${p('timelinePulse')}';
export function createTimelinePulse(container: HTMLElement, initial: TimelinePulseOptions = {}): TimelinePulseController {
  let opts: TimelinePulseOptions = { steps: ['Start', 'Process', 'Review', 'Done'], current: 0, color: '#22d3ee', ...initial };
  const root = document.createElement('div'); root.className = P;
  const axis = document.createElement('div'); axis.className = \`\${P}__axis\`;
  const track = document.createElement('div'); track.className = \`\${P}__track\`;
  const progress = document.createElement('div'); progress.className = \`\${P}__progress\`;
  const ul = document.createElement('ul'); ul.className = \`\${P}__steps\`;
  axis.append(track, progress, ul); root.appendChild(axis); container.appendChild(root);
  const render = () => {
    const steps = opts.steps ?? ['Start', 'Process', 'Review', 'Done'];
    const active = clamp(opts.current ?? 0, 0, Math.max(0, steps.length - 1));
    const ratio = steps.length > 1 ? active / (steps.length - 1) : 0;
    root.style.setProperty('--pulse-color', opts.color ?? '#22d3ee');
    root.style.setProperty('--step-count', String(steps.length));
    root.style.setProperty('--progress-ratio', String(ratio));
    ul.replaceChildren();
    steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = \`\${P}__step\`;
      li.dataset.state = i < active ? 'done' : i === active ? 'current' : 'pending';
      const dot = document.createElement('span'); dot.className = \`\${P}__dot\`;
      const name = document.createElement('span'); name.className = \`\${P}__name\`; name.textContent = step;
      li.append(dot, name); ul.appendChild(li);
    });
  };
  render();
  return { update(n) { opts = { ...opts, ...n }; render(); }, destroy() { root.remove(); } };
}`,
    element: `${attrNum('current')}\n${attrStr('color')}`,
    observed: ['current', 'color']
  }
};

// Continue with remaining components in part 2 - loaded from engines file
import { ENGINES_PART2 } from './batch-a-engines-part2.mjs';
Object.assign(COMPONENTS, ENGINES_PART2);

async function main() {
  for (const name of BATCH_A) {
    const def = COMPONENTS[name];
    if (!def) {
      console.error(`Missing definition for ${name}`);
      process.exit(1);
    }
    const exportName = toExportName(name);
    console.log(`Migrating ${name}...`);

    writeCore(name, def.types, def.engine, def.exposeMethods ?? []);

    const css = await convertComponentLessToCss(name);
    writeFileSync(join(COMPONENTS_DIR, name, 'style', 'index.css'), css);

    const expose = def.exposeMethods ?? [];
    writeV4Adapters(name, exportName, { exposeMethods: expose });
    if (expose.length && name === 'burnAway') {
      writeBurnAwayReact(name, exportName);
    }

    if (SLOT_COMPONENTS.has(name)) {
      writeSlotReact(name, exportName, def.slotExtraProps ?? '');
    } else if (name === 'waveButton') {
      writeWaveButtonReact(name, exportName);
    }

    writeElement(name, exportName, def.element ?? '', def.observed ?? [], def.elementMethods ?? '');

    writeFileSync(
      join(COMPONENTS_DIR, name, 'index.tsx'),
      `export { default } from './react';
export { default as ${exportName} } from './react';
export type * from './core/types';
`
    );
  }
  console.log(`Done: migrated ${BATCH_A.length} components.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
