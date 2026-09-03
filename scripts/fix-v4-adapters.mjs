#!/usr/bin/env node
/**
 * Fix v4 Vue + Element adapters from core/types.ts:
 * - Element: parse attrs (bool always emitted), JSON complex props, CustomEvents for on*
 * - Vue: defineEmits + wire on* callbacks; keep defineExpose from Handle
 *
 * Usage: node scripts/fix-v4-adapters.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS_DIR, toExportName } from './component-packages.mjs';
import { toElementTag } from './v4-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SKIP_PROPS = new Set(['className', 'style', 'children']);

function camelToKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function onToEvent(name) {
  return camelToKebab(name.slice(2));
}

function classifyType(typeText) {
  const t = typeText.replace(/\s+/g, ' ').trim();
  if (/\(/.test(t) || /=>/.test(t)) return 'callback';
  if (
    t.includes('{') ||
    t.includes('Record<') ||
    t.includes('Partial<') ||
    t.includes('[]') ||
    t.includes('Array<') ||
    t.includes(' object ')
  ) {
    return 'json';
  }
  if (/\bboolean\b/.test(t)) return 'boolean';
  if (/\bstring\b/.test(t)) return 'string';
  if (/\bnumber\b/.test(t)) return 'number';
  return 'json';
}

/** Remove nested `{ ... }` so Partial<{ a: string }> does not leak nested fields. */
function flattenBody(body) {
  let out = '';
  let depth = 0;
  for (const ch of body) {
    if (ch === '{') {
      depth += 1;
      if (depth === 1) out += ' object ';
      continue;
    }
    if (ch === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) out += ch;
  }
  return out;
}

function paramNames(params) {
  return params
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/\?/, '').split(/[=:]/)[0].trim())
    .filter(Boolean);
}

function extractInterfaceBody(source, interfaceName) {
  const re = new RegExp(
    `export interface ${interfaceName}\\s*(?:extends[^{]*)?\\{([\\s\\S]*?)\\n\\}`,
  );
  const m = source.match(re);
  return m?.[1] ?? null;
}

function resolveOptionsSource(componentDir, exportName) {
  const typesPath = join(componentDir, 'core', 'types.ts');
  let source = readFileSync(typesPath, 'utf8');
  let body = extractInterfaceBody(source, `${exportName}Options`);
  if (body) return { source, body, optionsName: `${exportName}Options` };

  // type XOptions = YProps / PhotoAlbumProps
  const alias = source.match(new RegExp(`export type ${exportName}Options\\s*=\\s*(\\w+)`));
  if (alias) {
    const target = alias[1];
    body = extractInterfaceBody(source, target);
    if (body) return { source, body, optionsName: `${exportName}Options` };
    // import from '../types'
    const importMatch = source.match(
      new RegExp(`import type \\{[^}]*\\b${target}\\b[^}]*\\} from '([^']+)'`),
    );
    if (importMatch) {
      const imported = join(componentDir, 'core', importMatch[1].replace(/^\.\//, '') + '.ts');
      const alt = join(componentDir, importMatch[1].replace(/^\.\.\//, '') + '.ts');
      const path = existsSync(imported)
        ? imported
        : existsSync(alt)
          ? alt
          : join(componentDir, 'types.ts');
      if (existsSync(path)) {
        source = readFileSync(path, 'utf8');
        body = extractInterfaceBody(source, target);
        if (body) return { source, body, optionsName: `${exportName}Options` };
      }
    }
  }
  return { source, body: '', optionsName: `${exportName}Options` };
}

function parseFields(body) {
  const fields = [];
  if (!body) return fields;
  const flat = flattenBody(body);
  const re = /^\s*(?:\/\*\*[\s\S]*?\*\/\s*)?([A-Za-z_][\w]*)\??:\s*([^;]+);/gm;
  let m;
  while ((m = re.exec(flat))) {
    const name = m[1];
    if (SKIP_PROPS.has(name)) continue;
    const kind = classifyType(m[2]);
    fields.push({ name, kind, type: m[2].trim() });
  }
  return fields;
}

function parseHandleMethods(componentDir, exportName) {
  const typesPath = join(componentDir, 'core', 'types.ts');
  const source = readFileSync(typesPath, 'utf8');
  const handleBody =
    extractInterfaceBody(source, `${exportName}Handle`) ||
    extractInterfaceBody(source, `${exportName}Controller`);
  if (!handleBody) return [];
  const methods = [];
  const re =
    /^\s*(?:\/\*\*[\s\S]*?\*\/\s*)?([A-Za-z_][\w]*)\s*(\??):\s*(\([^)]*\)\s*=>\s*[^;]+);/gm;
  let m;
  while ((m = re.exec(handleBody))) {
    const name = m[1];
    if (name === 'update' || name === 'destroy') continue;
    methods.push({ name, optional: Boolean(m[2]), sig: m[3].trim() });
  }
  // also method(): void style
  const re2 = /^\s*(?:\/\*\*[\s\S]*?\*\/\s*)?([A-Za-z_][\w]*)\s*\(([^)]*)\)\s*:\s*([^;]+);/gm;
  while ((m = re2.exec(handleBody))) {
    const name = m[1];
    if (name === 'update' || name === 'destroy') continue;
    if (methods.some((x) => x.name === name)) continue;
    methods.push({ name, optional: false, params: m[2], ret: m[3].trim() });
  }
  return methods;
}

function generateElement(componentName, exportName, fields, methods) {
  const tag = toElementTag(componentName);
  const optionsName = `${exportName}Options`;
  const controllerName = `${exportName}Controller`;
  const createName = `create${exportName}`;

  const attrFields = fields.filter((f) => f.kind !== 'callback');
  const callbacks = fields.filter((f) => f.kind === 'callback');
  const jsonFields = attrFields.filter((f) => f.kind === 'json');
  const boolFields = attrFields.filter((f) => f.kind === 'boolean');
  const numFields = attrFields.filter((f) => f.kind === 'number');
  const strFields = attrFields.filter((f) => f.kind === 'string');

  const observed = attrFields.map((f) => `'${camelToKebab(f.name)}'`).join(', ');

  const parseLines = [];
  parseLines.push(`  const options = {} as ${optionsName};`);

  for (const f of strFields) {
    const attr = camelToKebab(f.name);
    parseLines.push(
      `  if (el.hasAttribute('${attr}')) options.${f.name} = el.getAttribute('${attr}') ?? undefined;`,
    );
  }
  for (const f of numFields) {
    const attr = camelToKebab(f.name);
    parseLines.push(
      `  if (el.hasAttribute('${attr}')) options.${f.name} = Number(el.getAttribute('${attr}'));`,
    );
  }
  for (const f of boolFields) {
    const attr = camelToKebab(f.name);
    // Always emit boolean so Core update can clear flags when attribute is removed.
    parseLines.push(`  options.${f.name} = el.hasAttribute('${attr}');`);
  }
  for (const f of jsonFields) {
    const attr = camelToKebab(f.name);
    parseLines.push(`  if (el.hasAttribute('${attr}')) {`);
    parseLines.push(`    try {`);
    parseLines.push(
      `      options.${f.name} = JSON.parse(el.getAttribute('${attr}') ?? 'null') as ${optionsName}['${f.name}'];`,
    );
    parseLines.push(`    } catch { /* ignore invalid JSON */ }`);
    parseLines.push(`  }`);
    // JS property fallback for complex data (photos, prizes, …)
    parseLines.push(`  const prop${f.name} = (el as Cos${exportName}Element)._${f.name};`);
    parseLines.push(
      `  if (prop${f.name} !== undefined) options.${f.name} = prop${f.name} as ${optionsName}['${f.name}'];`,
    );
  }
  for (const f of callbacks) {
    const evt = onToEvent(f.name);
    parseLines.push(`  options.${f.name} = (...args: unknown[]) => {`);
    parseLines.push(
      `    el.dispatchEvent(new CustomEvent('${evt}', { detail: args.length <= 1 ? args[0] : args, bubbles: true }));`,
    );
    parseLines.push(`  };`);
  }

  const propAccessors = jsonFields
    .map(
      (f) => `
  _${f.name}?: ${optionsName}['${f.name}'];
  get ${f.name}(): ${optionsName}['${f.name}'] | undefined {
    return this._${f.name};
  }
  set ${f.name}(value: ${optionsName}['${f.name}']) {
    this._${f.name} = value;
    this.ctrl?.update(parseOptions(this));
  }`,
    )
    .join('');

  const methodFns = methods
    .map((m) => {
      if (m.params !== undefined) {
        const names = paramNames(m.params);
        return `
  ${m.name}(${m.params}) {
    return this.ctrl?.${m.name}(${names.join(', ')});
  }`;
      }
      const params = (m.sig.match(/^\(([^)]*)\)/) || [, ''])[1];
      const names = paramNames(params);
      return `
  ${m.name}(${params}) {
    return this.ctrl?.${m.name}(${names.join(', ')});
  }`;
    })
    .join('');

  return `import { ${createName}, type ${controllerName}, type ${optionsName} } from '../core';
import '../style/index.css';

const TAG = '${tag}';

function parseOptions(el: HTMLElement): ${optionsName} {
${parseLines.join('\n')}
  return options;
}

class Cos${exportName}Element extends HTMLElement {
  private ctrl: ${controllerName} | null = null;
${propAccessors}

  static get observedAttributes() {
    return [${observed}];
  }

  connectedCallback() {
    this.ctrl = ${createName}(this, parseOptions(this));
  }

  disconnectedCallback() {
    this.ctrl?.destroy();
    this.ctrl = null;
  }

  attributeChangedCallback() {
    this.ctrl?.update(parseOptions(this));
  }
${methodFns}
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) {
  customElements.define(TAG, Cos${exportName}Element);
}

export { Cos${exportName}Element, TAG };
`;
}

function generateVue(componentName, exportName, fields, methods) {
  const optionsName = `${exportName}Options`;
  const controllerName = `${exportName}Controller`;
  const createName = `create${exportName}`;
  const callbacks = fields.filter((f) => f.kind === 'callback');

  const emitEntries = callbacks.map((f) => `  '${onToEvent(f.name)}': [...args: unknown[]];`);
  const emitBlock =
    callbacks.length === 0
      ? 'const emit = defineEmits<{}>();'
      : `const emit = defineEmits<{\n${emitEntries.join('\n')}\n}>();`;

  const toOptionsLines = [`  ...props,`];
  for (const f of callbacks) {
    const evt = onToEvent(f.name);
    toOptionsLines.push(`  ${f.name}: (...args: unknown[]) => emit('${evt}', ...args),`);
  }

  const exposeLines =
    methods.length === 0
      ? 'defineExpose({});'
      : `defineExpose({\n${methods
          .map((m) => {
            if (m.params !== undefined) {
              const names = paramNames(m.params);
              return `  ${m.name}: (${m.params}) => ctrl?.${m.name}(${names.join(', ')}),`;
            }
            const params = (m.sig.match(/^\(([^)]*)\)/) || [, ''])[1];
            const names = paramNames(params);
            return `  ${m.name}: (${params}) => ctrl?.${m.name}(${names.join(', ')}),`;
          })
          .join('\n')}\n});`;

  return `<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { ${createName}, type ${controllerName}, type ${optionsName} } from '../core';
import '../style/index.css';

const props = defineProps<${optionsName}>();
${emitBlock}
const hostRef = ref<HTMLElement>();
let ctrl: ${controllerName} | null = null;

const toOptions = (): ${optionsName} => ({
${toOptionsLines.join('\n')}
});

onMounted(() => {
  if (hostRef.value) ctrl = ${createName}(hostRef.value, toOptions());
});

watch(() => ({ ...props }), () => ctrl?.update(toOptions()), { deep: true });

onUnmounted(() => {
  ctrl?.destroy();
  ctrl = null;
});

${exposeLines}
</script>

<template>
  <div ref="hostRef" class="cos-${componentName}-host" />
</template>
`;
}

function main() {
  const names = readdirSync(COMPONENTS_DIR).filter((d) =>
    existsSync(join(COMPONENTS_DIR, d, 'core', 'types.ts')),
  );

  let ok = 0;
  for (const name of names) {
    const exportName = toExportName(name);
    const componentDir = join(COMPONENTS_DIR, name);
    const { body } = resolveOptionsSource(componentDir, exportName);
    const fields = parseFields(body);
    const methods = parseHandleMethods(componentDir, exportName);

    const elementPath = join(componentDir, 'element', 'index.ts');
    const vuePath = join(componentDir, 'vue', `${exportName}.vue`);

    writeFileSync(elementPath, generateElement(name, exportName, fields, methods));
    writeFileSync(vuePath, generateVue(name, exportName, fields, methods));
    ok += 1;
  }

  console.log(`Fixed Vue + Element adapters for ${ok} components`);
}

main();
