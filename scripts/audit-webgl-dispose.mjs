#!/usr/bin/env node
/**
 * Static audit: C-class / WebGL / Three.js components must tear down GPU resources in destroy().
 * Usage: node scripts/audit-webgl-dispose.mjs
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
/** Keep in sync with scripts/migrate-batch-c.mjs */
const BATCH_C = [
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
  'weatherBackground',
];

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMP = join(ROOT, 'src/components');

const errors = [];
const warnings = [];

const componentUsesThree = (dir) => {
  const files = readdirSync(dir, { withFileTypes: true });
  for (const ent of files) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (componentUsesThree(full)) return true;
      continue;
    }
    if (!/\.(ts|tsx|js|mjs)$/.test(ent.name)) continue;
    const src = readFileSync(full, 'utf8');
    if (/from\s+['"]three['"]/.test(src) || /import\s+\*\s+as\s+THREE/.test(src)) return true;
  }
  return false;
};

const engineUsesWebGl = (src) =>
  /getContext\(\s*['"]webgl/.test(src) ||
  /WebGLRenderingContext/.test(src) ||
  /\bglCleanup\b/.test(src);

for (const name of BATCH_C) {
  const enginePath = join(COMP, name, 'core', 'engine.ts');
  if (!existsSync(enginePath)) {
    errors.push(`${name}: missing core/engine.ts (C-class)`);
    continue;
  }
  const engine = readFileSync(enginePath, 'utf8');
  const compDir = join(COMP, name);

  if (!/\bdestroy\s*\(\s*\)\s*\{/.test(engine)) {
    errors.push(`${name}: engine missing destroy()`);
    continue;
  }

  const usesThree = componentUsesThree(compDir);
  const usesWebGl = engineUsesWebGl(engine);

  if (usesThree) {
    if (!/\.dispose\s*\(/.test(engine) && !/dispose[A-Za-z]*\s*\(/.test(engine)) {
      errors.push(`${name}: uses three.js but destroy() does not call dispose()`);
    }
  }

  if (usesWebGl) {
    if (!/glCleanup\s*\?\.\(\)/.test(engine) && !/glCleanup\s*\(\)/.test(engine)) {
      errors.push(`${name}: WebGL engine but destroy() does not invoke glCleanup`);
    }
  }

  if (usesThree || usesWebGl) {
    if (!/\bdestroyed\b/.test(engine)) {
      warnings.push(`${name}: GPU engine should guard destroy with destroyed flag`);
    }
    if (!/cancelAnimationFrame|requestAnimationFrame/.test(engine)) {
      /* optional rAF — not all WebGL loops use it */
    }
  }
}

// Scan all engines for WebGL without teardown heuristic (outside BATCH_C)
const all = readdirSync(COMP).filter((d) => existsSync(join(COMP, d, 'core', 'engine.ts')));
for (const name of all) {
  if (BATCH_C.includes(name)) continue;
  const engine = readFileSync(join(COMP, name, 'core', 'engine.ts'), 'utf8');
  if (engineUsesWebGl(engine) && !/glCleanup\s*\?\.\(\)/.test(engine)) {
    warnings.push(`${name}: WebGL-like patterns outside BATCH_C — verify destroy teardown`);
  }
}

console.log(`WebGL/Three dispose audit — BATCH_C: ${BATCH_C.length} components`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}
console.log('\n✅ audit-webgl-dispose OK');
