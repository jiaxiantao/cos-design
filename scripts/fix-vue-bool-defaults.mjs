#!/usr/bin/env node
/**
 * Vue casts missing Boolean props to `false`, which overrides engine defaults
 * like interactive/showHint/auto: true. Patch Vue adapters with withDefaults.
 *
 * Also fix Element adapters: only set true-default bools when the attribute is present.
 *
 * Usage: node scripts/fix-vue-bool-defaults.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPONENTS_DIR, toExportName } from './component-packages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Booleans that engines treat as true when omitted. */
const TRUE_DEFAULT_BOOLS = [
  'auto',
  'autoCharge',
  'interactive',
  'showHint',
  'showAccessories',
  'showCaption',
  'showPageNumber',
  'autoRotate',
];

/** Components where interactive follows auto (`interactive ?? auto`) — keep undefined. */
const INTERACTIVE_FOLLOWS_AUTO = new Set(['fireworks', 'confetti']);

function extractOptionsBools(typesSource, exportName, componentName) {
  /** @type {Map<string, true | undefined>} */
  const defaults = new Map();
  const re = new RegExp(
    `export interface ${exportName}Options\\s*(?:extends[^{]*)?\\{([\\s\\S]*?)\\n\\}`,
  );
  let body = typesSource.match(re)?.[1];
  if (!body) {
    const alias = typesSource.match(new RegExp(`export type ${exportName}Options\\s*=\\s*(\\w+)`));
    if (alias) {
      body = typesSource.match(
        new RegExp(`export interface ${alias[1]}\\s*(?:extends[^{]*)?\\{([\\s\\S]*?)\\n\\}`),
      )?.[1];
    }
  }
  if (!body) return defaults;
  for (const name of TRUE_DEFAULT_BOOLS) {
    if (!new RegExp(`\\b${name}\\?:\\s*boolean\\b`).test(body)) continue;
    if (name === 'interactive' && INTERACTIVE_FOLLOWS_AUTO.has(componentName)) {
      defaults.set(name, undefined);
    } else {
      defaults.set(name, true);
    }
  }
  return defaults;
}

function patchVue(vuePath, trueDefaults) {
  if (trueDefaults.size === 0) return false;
  let src = readFileSync(vuePath, 'utf8');
  if (src.includes('withDefaults(defineProps')) return false;

  const defaultsLiteral = [...trueDefaults.entries()]
    .map(([k, v]) => `  ${k}: ${v === undefined ? 'undefined' : 'true'},`)
    .join('\n');

  if (!src.includes('withDefaults')) {
    src = src.replace(
      /import \{([^}]+)\} from 'vue';/,
      (m, names) => {
        if (names.includes('withDefaults')) return m;
        return `import { ${names.trim().replace(/,$/, '')}, withDefaults } from 'vue';`;
      },
    );
  }

  const next = src.replace(
    /const props = defineProps<([^>]+)>\(\);/,
    `const props = withDefaults(defineProps<$1>(), {\n${defaultsLiteral}\n});`,
  );
  if (next === src) return false;
  writeFileSync(vuePath, next);
  return true;
}

function patchElement(elementPath, trueDefaults) {
  if (trueDefaults.size === 0) return false;
  let src = readFileSync(elementPath, 'utf8');
  let changed = false;

  for (const name of trueDefaults) {
    const attr = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    // Replace unconditional `options.x = el.hasAttribute('x')` with present-only parse
    // (keeps engine defaults when attribute omitted; supports interactive="false").
    const unconditional = new RegExp(
      `^\\s*options\\.${name} = el\\.hasAttribute\\('${attr}'\\);\\s*$`,
      'm',
    );
    if (unconditional.test(src)) {
      src = src.replace(
        unconditional,
        `  if (el.hasAttribute('${attr}')) {\n    const raw = el.getAttribute('${attr}');\n    options.${name} = raw !== 'false' && raw !== '0';\n  }`,
      );
      changed = true;
      continue;
    }
  }

  if (changed) writeFileSync(elementPath, src);
  return changed;
}

function main() {
  const names = readdirSync(COMPONENTS_DIR).filter((d) =>
    existsSync(join(COMPONENTS_DIR, d, 'core', 'types.ts')),
  );

  let vueOk = 0;
  let elOk = 0;
  for (const name of names) {
    const exportName = toExportName(name);
    const typesPath = join(COMPONENTS_DIR, name, 'core', 'types.ts');
    const typesSource = readFileSync(typesPath, 'utf8');
    const trueDefaults = extractOptionsBools(typesSource, exportName, name);
    if (trueDefaults.size === 0) continue;

    const vuePath = join(COMPONENTS_DIR, name, 'vue', `${exportName}.vue`);
    if (existsSync(vuePath) && patchVue(vuePath, trueDefaults)) {
      vueOk += 1;
      console.log(
        `vue  ${name}: ${[...trueDefaults.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`,
      );
    }

    const elementPath = join(COMPONENTS_DIR, name, 'element', 'index.ts');
    if (existsSync(elementPath) && patchElement(elementPath, new Set(trueDefaults.keys()))) {
      elOk += 1;
      console.log(`el   ${name}: ${[...trueDefaults.keys()].join(', ')}`);
    }
  }

  console.log(`Patched ${vueOk} Vue adapters, ${elOk} Element adapters`);
}

main();
