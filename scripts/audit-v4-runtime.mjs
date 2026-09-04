#!/usr/bin/env node
/**
 * Static audit for common v4 regressions before release.
 * Usage: node scripts/audit-v4-runtime.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMP = join(ROOT, 'src/components');
const demosPath = join(ROOT, 'src/pages/config/demo-components.tsx');
const componentsPath = join(ROOT, 'src/pages/config/components.ts');

const errors = [];
const warnings = [];

const components = readdirSync(COMP).filter((d) => existsSync(join(COMP, d, 'core', 'engine.ts')));

const demosSrc = readFileSync(demosPath, 'utf8');
const componentsSrc = readFileSync(componentsPath, 'utf8');

const exportName = (dir) => dir.charAt(0).toUpperCase() + dir.slice(1);

for (const name of components) {
  const enginePath = join(COMP, name, 'core', 'engine.ts');
  const cssPath = join(COMP, name, 'style', 'index.css');
  const reactPath = join(COMP, name, 'react', 'index.tsx');
  const vuePath = join(COMP, name, 'vue', `${exportName(name)}.vue`);
  const elementPath = join(COMP, name, 'element', 'index.ts');
  const engine = readFileSync(enginePath, 'utf8');
  const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';

  // 1) createElement without append for common card patterns (FlipCounter-class bug)
  if (/createElement\('div'\)[\s\S]{0,400}className = `\$\{P\}__digit-card`/.test(engine)) {
    if (!/digit\.appendChild\(card\)/.test(engine) && !/digit\.append\(card/.test(engine)) {
      errors.push(`${name}: digit-card created but not appended to digit`);
    }
  }

  // 2) CSS BEM modifiers referenced in engine but missing in CSS
  const toggles = [...engine.matchAll(/classList\.toggle\(`\$\{P\}__([^`]+)`/g)].map((m) => m[1]);
  const classAssigns = [...engine.matchAll(/className = `\$\{P\}__([^`$]+)`/g)].map((m) =>
    m[1].replace(/\$\{[^}]+\}/g, '').replace(/\s+/g, ''),
  );
  for (const mod of toggles) {
    // skip dynamic concatenations with ternary remnants
    if (!mod || mod.includes('${') || mod.includes('?')) continue;
    const needle = `.cos-${name.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, '')}`;
    // class names use kebab from P constant usually cos-<kebab>
    const pMatch = engine.match(/const P = '([^']+)'/);
    const p = pMatch?.[1];
    if (!p) continue;
    const selector = `.${p}__${mod}`;
    if (css && !css.includes(selector) && !css.includes(`.${p}__${mod.split('--')[0]}`)) {
      // only warn for --modifier style classes which are easy to mistype
      if (mod.includes('--') && !css.includes(mod)) {
        warnings.push(`${name}: engine toggles ${selector} but CSS may not define it`);
      }
    }
  }

  // 3) paint/replaceChildren on pointermove anti-pattern
  if (/pointermove[\s\S]{0,200}paint\(/.test(engine) && /replaceChildren\(/.test(engine)) {
    warnings.push(
      `${name}: pointermove may call paint() that uses replaceChildren (risk of detaching captured node)`,
    );
  }

  // 4) display:flex on hint without [hidden] override
  if (css.includes('__hint') && /__hint\s*\{[^}]*display:\s*flex/s.test(css)) {
    if (!css.includes('__hint[hidden]')) {
      warnings.push(`${name}: __hint uses display:flex without [hidden] { display:none } override`);
    }
  }

  // 5) Vue/element/react presence
  for (const [label, path] of [
    ['react', reactPath],
    ['vue', vuePath],
    ['element', elementPath],
  ]) {
    if (!existsSync(path)) errors.push(`${name}: missing ${label} adapter (${path})`);
  }
}

// 6) Controlled demos that animate in React but codeExample is static — heuristic
const animatedDemoNames = [];
if (/setInterval\(/.test(demosSrc) || /setTimeout\(/.test(demosSrc)) {
  // ProgressChest / FlipCounter style demos already use auto; still scan code examples
}
const exampleBlocks = [...componentsSrc.matchAll(/name:\s*'([^']+)'[\s\S]*?codeExample:\s*`([\s\S]*?)`/g)];
for (const [, name, example] of exampleBlocks) {
  // static progress without auto
  if (/progress=\{/.test(example) && !/\bauto\b/.test(example) && name === 'ProgressChest') {
    errors.push(`${name}: codeExample has static progress without auto`);
  }
  if (name === 'FlipCounter' && /value=\{/.test(example) && !/\bauto\b/.test(example)) {
    warnings.push(`${name}: codeExample has static value without auto (framework tabs won't animate)`);
  }
  if (name === 'Confetti' && /auto=\{false\}/.test(example) && !/\binteractive\b/.test(example)) {
    errors.push(`${name}: codeExample auto={false} without interactive (clicks disabled)`);
  }
  if (name === 'Turntable') {
    const prizes = example.match(/prizes=\{\[([\s\S]*?)\]\}/);
    if (prizes) {
      const count = (prizes[1].match(/label:/g) || []).length;
      if (count < 2) errors.push(`${name}: codeExample has fewer than 2 prizes (${count})`);
    }
  }
}

// 7) shared host centering helpers exported
const sharedHost = readFileSync(join(ROOT, 'packages/shared/src/host-layout.ts'), 'utf8');
if (!/marginInline/.test(sharedHost)) {
  errors.push('shared host-layout: missing marginInline centering for fixed-size hosts');
}

console.log(`Audited ${components.length} engines`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log(`  ⚠ ${w}`);
  if (warnings.length > 40) console.log(`  … +${warnings.length - 40} more`);
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}
console.log('\n✅ audit-v4-runtime OK');
