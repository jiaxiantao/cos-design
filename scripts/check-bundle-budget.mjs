#!/usr/bin/env node
/**
 * Gzip budgets for representative packages, plus a guard that only PhotoLantern imports three.
 * Run after `pnpm build`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * React ESM gzip ceilings (bytes), including local `./chunk.js` imports.
 * Measured on this change (headroom ~40–70%): neon 809, scratch 1687,
 * fireworks 2278, turntable 2334, weather 15974, photo-lantern 7496,
 * umbrella index+engine ≈ 149038. Three itself is far above the lantern cap.
 */
const BUDGETS = [
  {
    id: '@cos-design/neon-text',
    file: 'packages/neonText/dist/react/index.js',
    maxGzip: 1_600,
  },
  {
    id: '@cos-design/scratch-card',
    file: 'packages/scratchCard/dist/react/index.js',
    maxGzip: 3_500,
  },
  {
    id: '@cos-design/fireworks',
    file: 'packages/fireworks/dist/react/index.js',
    maxGzip: 4_500,
  },
  {
    id: '@cos-design/turntable',
    file: 'packages/turntable/dist/react/index.js',
    maxGzip: 4_500,
  },
  {
    id: '@cos-design/weather-background',
    file: 'packages/weatherBackground/dist/react/index.js',
    maxGzip: 26_000,
  },
  {
    id: '@cos-design/photo-lantern',
    file: 'packages/photoLantern/dist/react/index.js',
    maxGzip: 14_000,
  },
  {
    id: 'cos-design',
    file: 'packages/cos-design/dist/index.js',
    maxGzip: 210_000,
  },
];

const THREE_IMPORTERS = new Set(['photoLantern']);
const EXTERNAL_THREE_ENTRIES = [
  'packages/photoLantern/dist/react/index.js',
  'packages/cos-design/dist/index.js',
];

const errors = [];

const gzipSize = (abs) => gzipSync(readFileSync(abs)).length;

/** Follow relative JS chunks so the umbrella engine file counts toward the entry. */
const graphFiles = (entryAbs) => {
  const seen = new Set();
  const stack = [entryAbs];
  while (stack.length) {
    const current = stack.pop();
    if (!current || seen.has(current) || !existsSync(current)) continue;
    seen.add(current);
    const source = readFileSync(current, 'utf8');
    const re = /from\s*["'](\.\/[^"']+)["']/g;
    let match = re.exec(source);
    while (match) {
      const spec = match[1];
      const resolved = join(dirname(current), spec.endsWith('.js') ? spec : `${spec}.js`);
      stack.push(resolved);
      match = re.exec(source);
    }
  }
  return [...seen];
};

const gzipGraph = (entryAbs) => graphFiles(entryAbs).reduce((sum, file) => sum + gzipSize(file), 0);

for (const item of BUDGETS) {
  const abs = join(ROOT, item.file);
  if (!existsSync(abs)) {
    errors.push(`${item.id}: missing ${item.file} (run pnpm build first)`);
    continue;
  }
  const size = gzipGraph(abs);
  const mark = size <= item.maxGzip ? 'ok' : 'OVER';
  console.log(`${mark}\t${item.id}\t${size}\t/ ${item.maxGzip} gzip`);
  if (size > item.maxGzip) {
    errors.push(`${item.id} gzip ${size} exceeds ${item.maxGzip} (${item.file})`);
  }
}

const usesThreeImport = (source) =>
  /from\s+['"]three['"]/.test(source) ||
  /import\s+\*\s+as\s+THREE\s+from\s+['"]three['"]/.test(source);

const walk = (dir, visit) => {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, visit);
      continue;
    }
    if (/\.(ts|tsx|js|mjs)$/.test(ent.name)) visit(full);
  }
};

const componentsDir = join(ROOT, 'src/components');
const foundThree = new Set();
walk(componentsDir, (file) => {
  const source = readFileSync(file, 'utf8');
  if (!usesThreeImport(source)) return;
  const rel = file.slice(componentsDir.length + 1);
  const component = rel.split(/[/\\]/)[0];
  foundThree.add(component);
});

for (const name of foundThree) {
  if (!THREE_IMPORTERS.has(name)) {
    errors.push(
      `${name} imports three but is not in THREE_IMPORTERS — update docs/bundle-budget.md`,
    );
  }
}
for (const name of THREE_IMPORTERS) {
  if (!foundThree.has(name)) {
    errors.push(`${name} is listed as a three importer but no import was found`);
  }
}
console.log(`three importers: ${[...foundThree].sort().join(', ') || '(none)'}`);

for (const rel of EXTERNAL_THREE_ENTRIES) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) {
    errors.push(`missing ${rel}`);
    continue;
  }
  const bundled = graphFiles(abs).some((file) =>
    /from\s*["']three["']/.test(readFileSync(file, 'utf8')),
  );
  if (!bundled) {
    errors.push(`${rel} graph should keep three external (from "three")`);
  }
}

if (errors.length) {
  console.error('\nBundle budget failed:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log('\nBundle budget ok');
