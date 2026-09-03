#!/usr/bin/env node
/**
 * Auto-convert React canvas/DOM components to v4 core/engine.ts + types.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toExportName, toPackageId } from '../component-packages.mjs';

const BATCH_B = [
  'audioVisualizer', 'aurora', 'auroraVeil', 'bubbleField', 'canvasClock', 'clickSpark', 'confetti',
  'cursorTrail', 'cyberGrid', 'dandelionField', 'diceRoll', 'electricArc', 'flipCounter', 'gameOfLife',
  'gravityBalls', 'inkBloom', 'matrixRain', 'mazeGenerator', 'meteorRain', 'networkGraph',
  'particleNetwork', 'radarScan', 'redPacketRain', 'returnCity', 'ropeChain', 'sandFall', 'smokeFog',
  'snowfall', 'starfield', 'progressChest', 'countUp', 'countdown', 'flipCard', 'speedometer'
];

const IMPERATIVE = {
  confetti: ['burst'],
  redPacketRain: ['start', 'stop', 'reset'],
  flipCard: ['flip', 'reset']
};

const SLOT = new Set(['clickSpark']);

const PREFIX = (name) => `cos-${toPackageId(name)}`;

function extractBlock(src, startPattern, endChar = '}') {
  const start = src.search(startPattern);
  if (start < 0) return '';
  let depth = 0;
  let started = false;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') {
      depth++;
      started = true;
    } else if (src[i] === '}') {
      depth--;
      if (started && depth === 0) return src.slice(start, i + 1);
    }
  }
  return '';
}

function extractInterfaces(src) {
  const interfaces = [];
  const re = /export interface (\w+)\s*\{[\s\S]*?\n\}/g;
  let m;
  while ((m = re.exec(src))) interfaces.push(m[0]);
  return interfaces;
}

function propsToOptions(interfaces, exportName) {
  const propsName = `${exportName}Props`;
  const handleName = `${exportName}Handle`;
  let optionsBlock = '';
  let handleBlock = '';
  for (const iface of interfaces) {
    if (iface.includes(`interface ${propsName}`)) {
      optionsBlock = iface
        .replace(`interface ${propsName}`, `interface ${exportName}Options`)
        .replace('export interface', 'export interface');
    }
    if (iface.includes(`interface ${handleName}`)) {
      handleBlock = iface;
    }
  }
  return { optionsBlock, handleBlock, propsName, handleName };
}

function extractHelpers(src) {
  const lines = [];
  const skip = /^(import |export default|const \w+ = forwardRef|const \w+: React\.FC)/;
  for (const line of src.split('\n')) {
    if (skip.test(line.trim())) continue;
    if (line.includes('styles.') || line.includes('index.module.less')) continue;
  }
  // Extract const/function definitions before main component
  const mainStart = src.search(/const \w+ = forwardRef|const \w+: React\.FC|= forwardRef/);
  const header = mainStart > 0 ? src.slice(0, mainStart) : '';
  return header
    .split('\n')
    .filter((l) => !l.startsWith('import ') && !l.startsWith('export type') && l.trim())
    .join('\n');
}

function hasFill(src) {
  return /fill\s*[=:?]/.test(src) || /fillProp/.test(src);
}

function buildTypes(exportName, optionsBlock, handleBlock, imperative) {
  const handleMethods = imperative.map((m) => `  ${m}(): void;`).join('\n');
  const handleType = imperative.length
    ? `\nexport interface ${exportName}Handle {\n${handleMethods}\n}\n`
    : handleBlock
      ? `\n${handleBlock.replace('export interface', 'export interface')}\n`
      : '';

  const controllerExtra = imperative.length
    ? imperative.map((m) => `  ${m}(): void;`).join('\n')
    : '';

  return `${optionsBlock}
${handleType}
export interface ${exportName}Controller {
  update(options: Partial<${exportName}Options>): void;
${controllerExtra ? controllerExtra + '\n' : ''}  destroy(): void;
}

export type ${exportName}Props = ${exportName}Options;
`;
}

function convert(name) {
  if (existsSync(join(COMPONENTS_DIR, name, 'core', 'index.ts'))) {
    console.log(`skip ${name}`);
    return;
  }

  const srcPath = join(COMPONENTS_DIR, name, 'index.tsx');
  if (!existsSync(srcPath)) {
    console.error(`missing ${srcPath}`);
    return;
  }

  const src = readFileSync(srcPath, 'utf8');
  const exportName = toExportName(name);
  const prefix = PREFIX(name);
  const imperative = IMPERATIVE[name] ?? [];
  const interfaces = extractInterfaces(src);
  const { optionsBlock, handleBlock } = propsToOptions(interfaces, exportName);
  const helpers = extractHelpers(src);

  // Copy sibling .ts modules to core/
  const dir = join(COMPONENTS_DIR, name);
  const coreDir = join(dir, 'core');
  mkdirSync(coreDir, { recursive: true });
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.ts') && f !== 'index.ts') {
      writeFileSync(join(coreDir, f), readFileSync(join(dir, f), 'utf8'));
    }
  }

  const typesTs = buildTypes(exportName, optionsBlock, handleBlock, imperative);

  // Check if manual engine exists
  const manualEngine = join(import.meta.dirname, 'engines', `${name}.ts`);
  if (existsSync(manualEngine)) {
    writeFileSync(join(coreDir, 'types.ts'), typesTs);
    writeFileSync(join(coreDir, 'engine.ts'), readFileSync(manualEngine, 'utf8'));
    writeFileSync(
      join(coreDir, 'index.ts'),
      `export { create${exportName} } from './engine';
export type { ${exportName}Controller, ${exportName}Options, ${exportName}Props${imperative.length ? `, ${exportName}Handle` : ''} } from './types';
`
    );
    console.log(`converted ${name} (manual engine)`);
    return;
  }

  console.warn(`No manual engine for ${name} — needs scripts/batch-b/engines/${name}.ts`);
}

for (const name of BATCH_B) convert(name);
