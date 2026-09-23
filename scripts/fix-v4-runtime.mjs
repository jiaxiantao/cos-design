#!/usr/bin/env node
/**
 * Restore v3-compatible runtime for v4 adapters/engines.
 * Usage: node scripts/fix-v4-runtime.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS_DIR, toExportName } from './component-packages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SLOTTED = new Set([
  'barcodeScan',
  'clickSpark',
  'magneticButton',
  'spotlight',
  'liquidGlass',
]);
const DEFAULT_TRUE_BOOLS = ['auto', 'interactive', 'showHint'];

const comps = readdirSync(COMPONENTS_DIR).filter((d) =>
  existsSync(join(COMPONENTS_DIR, d, 'core', 'engine.ts')),
);

function ensureSharedImport(src, name) {
  if (src.includes(name)) return src;
  if (/import \{[^}]+\} from '@cos-design\/shared';/.test(src)) {
    return src.replace(/import \{([^}]+)\} from '@cos-design\/shared';/, (m, names) => {
      if (names.includes(name)) return m;
      return `import { ${names.trim().replace(/,$/, '')}, ${name} } from '@cos-design/shared';`;
    });
  }
  return `import { ${name} } from '@cos-design/shared';\n${src}`;
}

function patchApplyLayout(src) {
  const before = src;
  // Match fill/else root sizing blocks
  src = src.replace(
    /if \(([^)]+)\) \{\s*root\.style\.width = '100%';\s*root\.style\.height = '100%';\s*\} else \{\s*root\.style\.width = `\$\{([^}]+)\}px`;\s*root\.style\.height = `\$\{([^}]+)\}px`;\s*\}/g,
    (_m, cond, w, h) =>
      `applyCanvasHostBox(container, root, { fill: Boolean(${cond}), width: ${w}, height: ${h} });`,
  );
  if (src !== before) src = ensureSharedImport(src, 'applyCanvasHostBox');
  return src;
}

function patchDoubleTick(src) {
  return src.replace(
    /unbindMotion = bindPrefersReducedMotion\(\((\w+)\) => \{([\s\S]*?)\n  \}\);/g,
    (full, arg, body) => {
      const next = body
        .replace(/\n\s*else\s+tick\(\);/g, '')
        .replace(/\n\s*else\s*\{\s*tick\(\);\s*\}/g, '');
      return `unbindMotion = bindPrefersReducedMotion((${arg}) => {${next}\n  });`;
    },
  );
}

function patchFireworksUpdate(src) {
  if (!src.includes('setupAutoTimer') || !src.includes('bindSizeObserver')) return src;
  return src.replace(
    /const update = \(next: Partial<(\w+)>\) => \{[\s\S]*?\n  \};/,
    (_m, optName) => `const update = (next: Partial<${optName}>) => {
    const prev = options;
    options = { ...options, ...next };
    if (next.onComplete !== undefined) {
      onCompleteRef.current = next.onComplete;
    }
    const sizeChanged =
      prev.fill !== options.fill || prev.width !== options.width || prev.height !== options.height;
    const lookChanged =
      prev.auto !== options.auto ||
      prev.interactive !== options.interactive ||
      prev.hint !== options.hint;
    if (sizeChanged) bindSizeObserver();
    if (lookChanged) {
      syncInteractive();
      setupAutoTimer();
    }
  };`,
  );
}

function patchWeatherUpdate(src) {
  return src.replace(
    /else if \(!sizeChanged\) rebuildScene\(\);/,
    `else {
        const fp = (o: typeof options) =>
          JSON.stringify(o, (_k, v) => (typeof v === 'function' ? undefined : v));
        if (fp(prev) !== fp(options)) rebuildScene();
      }`,
  );
}

function patchRippleResize(src) {
  if (!src.includes('const setupGl = ()')) return src;
  if (src.includes('lastGlSize')) return src;
  src = src.replace(
    /const setupGl = \(\) => \{/,
    `let lastGlSize = { w: 0, h: 0 };
  const setupGl = () => {
    if (lastGlSize.w === width && lastGlSize.h === height && glCleanup) return;
    lastGlSize = { w: width, h: height };`,
  );
  return src;
}

function writeReactAdapter(dir, slotted) {
  const exportName = toExportName(dir);
  const types = readFileSync(join(COMPONENTS_DIR, dir, 'core', 'types.ts'), 'utf8');
  const handleName = types.match(/export interface (\w+Handle)/)?.[1];
  const optionsName = types.match(/export interface (\w+Options)/)?.[1] ?? `${exportName}Options`;
  const createName = `create${exportName}`;
  const ctrlName = `${exportName}Controller`;

  let methods = [];
  if (handleName) {
    const body = types.match(new RegExp(`export interface ${handleName} \\{([\\s\\S]*?)\\n\\}`));
    if (body) methods = [...body[1].matchAll(/^\s*(\w+)\s*[:(]/gm)].map((m) => m[1]);
  }

  const imperative = methods.length
    ? `useImperativeHandle(ref, () => ({\n${methods
        .map((m) => `    ${m}: (...args: never[]) => (ctrlRef.current as any)?.${m}?.(...args),`)
        .join('\n')}\n  }));`
    : `useImperativeHandle(ref, () => ({}));`;

  const handleType = handleName ?? 'unknown';

  let code;
  if (slotted) {
    code = `import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { ${createName}, type ${ctrlName}, type ${optionsName} } from '../core';
import '../style/index.css';

export type { ${optionsName} } from '../core/types';

type SlotProps = ${optionsName} & { children?: React.ReactNode };

const ${exportName} = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${ctrlName} | null>(null);
  const propsRef = useRef(props);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  ${imperative}

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = ${createName}(host, propsRef.current);
    ctrlRef.current = ctrl;
    setSlotEl(typeof ctrl.getSlot === 'function' ? ctrl.getSlot() : null);
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
      setSlotEl(null);
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return (
    <div ref={hostRef} className="cos-${dir}-host">
      {slotEl && children != null ? createPortal(children, slotEl) : null}
    </div>
  );
});

${exportName}.displayName = '${exportName}';

export default ${exportName};
`;
  } else {
    code = `import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { ${createName}, type ${ctrlName}, type ${optionsName} } from '../core';
${handleName ? `import type { ${handleName} } from '../core/types';\n` : ''}import '../style/index.css';

export type { ${optionsName}${handleName ? `, ${handleName}` : ''} } from '../core/types';

const ${exportName} = forwardRef<${handleType}, ${optionsName}>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<${ctrlName} | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  ${imperative}

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = ${createName}(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-${dir}-host" />;
});

${exportName}.displayName = '${exportName}';

export default ${exportName};
`;
  }

  writeFileSync(join(COMPONENTS_DIR, dir, 'react', 'index.tsx'), code);
}

function patchVueFingerprint(dir) {
  const exportName = toExportName(dir);
  const vuePath = join(COMPONENTS_DIR, dir, 'vue', `${exportName}.vue`);
  if (!existsSync(vuePath)) return;
  let src = readFileSync(vuePath, 'utf8');
  if (src.includes('optionsFingerprint')) return;

  if (!src.includes("from '@cos-design/shared'")) {
    src = src.replace(
      /(<script setup[^>]*>\n)/,
      `$1import { optionsFingerprint } from '@cos-design/shared';\n`,
    );
  }

  // Common generated pattern
  const replaced = src.replace(
    /watch\(\s*\(\) => \([\s\S]*?\{[\s\S]*?\.\.\.props[\s\S]*?\}\)[\s\S]*?,\s*\([^)]*\)\s*=>\s*\{[\s\S]*?ctrl\.value\?\.update\([^;]+;[\s\S]*?\},?\s*(?:\{[\s\S]*?\})?\s*\);/,
    `watch(
  () => optionsFingerprint(props),
  () => {
    ctrl.value?.update({ ...props } as never);
  },
);`,
  );

  if (replaced !== src) writeFileSync(vuePath, replaced);
}

function patchElementBools(dir) {
  const elPath = join(COMPONENTS_DIR, dir, 'element', 'index.ts');
  if (!existsSync(elPath)) return;
  let src = readFileSync(elPath, 'utf8');
  let changed = false;
  for (const name of DEFAULT_TRUE_BOOLS) {
    const bad = `options.${name} = el.hasAttribute('${name}');`;
    const good = `if (el.hasAttribute('${name}')) {
    const raw = el.getAttribute('${name}');
    options.${name} = raw !== 'false' && raw !== '0';
  }`;
    if (src.includes(bad)) {
      src = src.replaceAll(bad, good);
      changed = true;
    }
  }
  if (changed) writeFileSync(elPath, src);
}

function ensureGetSlot(dir) {
  const engPath = join(COMPONENTS_DIR, dir, 'core', 'engine.ts');
  let src = readFileSync(engPath, 'utf8');
  const typesPath = join(COMPONENTS_DIR, dir, 'core', 'types.ts');
  let types = readFileSync(typesPath, 'utf8');

  if (!src.includes('getSlot')) {
    // find content element variable
    if (!/const content = /.test(src)) return;
    src = src.replace(
      /(return \{\n)(\s*)(update)/,
      `$1$2getSlot: () => content,\n$2$3`,
    );
    writeFileSync(engPath, src);
  }

  if (!types.includes('getSlot')) {
    types = types.replace(
      /(export interface \w+Controller \{)/,
      `$1\n  getSlot(): HTMLElement;`,
    );
    writeFileSync(typesPath, types);
  }

  // Soft mountSlot — don't wipe portal children
  src = readFileSync(engPath, 'utf8');
  if (src.includes('const mountSlot')) {
    src = src.replace(
      /const mountSlot = \(\) => \{[\s\S]*?\n  \};/,
      `const mountSlot = () => {
    if (opts.slotElement) {
      if (opts.slotElement.parentElement !== content) {
        content.replaceChildren();
        content.appendChild(opts.slotElement);
      }
      return;
    }
    // React/Vue portals own the children — do not clear existing nodes
    if (content.childNodes.length > 0) return;
    const ph = document.createElement('span');
    ph.className = \`\${root.className}__placeholder\`;
    ph.textContent = (opts as { defaultContent?: string }).defaultContent ?? '';
    content.replaceChildren(ph);
  };`,
    );
    writeFileSync(engPath, src);
  }

  // clickSpark initial slot
  if (dir === 'clickSpark') {
    src = readFileSync(engPath, 'utf8');
    src = src.replace(
      /if \(options\.slotElement\) \{\s*content\.appendChild\(options\.slotElement\);\s*hintEl\.hidden = true;\s*\}/,
      `if (options.slotElement && options.slotElement.parentElement !== content) {
    content.appendChild(options.slotElement);
    hintEl.hidden = true;
  } else if (content.childNodes.length > 0) {
    hintEl.hidden = true;
  }`,
    );
    writeFileSync(engPath, src);
  }
}

let stats = { engines: 0, react: 0, vue: 0, element: 0, slot: 0 };

for (const dir of comps) {
  const engPath = join(COMPONENTS_DIR, dir, 'core', 'engine.ts');
  let eng = readFileSync(engPath, 'utf8');
  const before = eng;
  eng = patchApplyLayout(eng);
  eng = patchDoubleTick(eng);
  if (dir === 'fireworks' || dir === 'confetti') eng = patchFireworksUpdate(eng);
  if (dir === 'weatherBackground') eng = patchWeatherUpdate(eng);
  if (dir === 'rippleWater' || dir === 'lavaBubble') eng = patchRippleResize(eng);
  if (eng !== before) {
    writeFileSync(engPath, eng);
    stats.engines += 1;
  }

  if (SLOTTED.has(dir)) {
    ensureGetSlot(dir);
    stats.slot += 1;
  }

  if (dir !== 'waveButton') {
    writeReactAdapter(dir, SLOTTED.has(dir));
    stats.react += 1;
  }

  const vueBefore = existsSync(join(COMPONENTS_DIR, dir, 'vue', `${toExportName(dir)}.vue`))
    ? readFileSync(join(COMPONENTS_DIR, dir, 'vue', `${toExportName(dir)}.vue`), 'utf8')
    : '';
  patchVueFingerprint(dir);
  const vueAfter = existsSync(join(COMPONENTS_DIR, dir, 'vue', `${toExportName(dir)}.vue`))
    ? readFileSync(join(COMPONENTS_DIR, dir, 'vue', `${toExportName(dir)}.vue`), 'utf8')
    : '';
  if (vueBefore !== vueAfter) stats.vue += 1;

  const elPath = join(COMPONENTS_DIR, dir, 'element', 'index.ts');
  const elBefore = existsSync(elPath) ? readFileSync(elPath, 'utf8') : '';
  patchElementBools(dir);
  const elAfter = existsSync(elPath) ? readFileSync(elPath, 'utf8') : '';
  if (elBefore !== elAfter) stats.element += 1;
}

console.log(JSON.stringify(stats, null, 2));
