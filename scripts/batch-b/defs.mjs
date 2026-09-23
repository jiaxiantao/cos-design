import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toExportName } from '../component-packages.mjs';

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

const ELEMENT_ATTRS = {
  starfield: { attrs: ["  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));", "  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));", "  if (el.hasAttribute('fill')) options.fill = true;", "  if (el.hasAttribute('star-count')) options.starCount = Number(el.getAttribute('star-count'));", "  if (el.hasAttribute('speed')) options.speed = Number(el.getAttribute('speed'));"], observed: ['width', 'height', 'fill', 'star-count', 'speed'] },
  confetti: { attrs: ["  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));", "  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));", "  if (el.hasAttribute('fill')) options.fill = true;", "  if (el.hasAttribute('auto')) options.auto = el.getAttribute('auto') !== 'false';"], observed: ['width', 'height', 'fill', 'auto'], methods: "\n  burst() { this.ctrl?.burst(); }\n" },
  redPacketRain: { attrs: ["  if (el.hasAttribute('width')) options.width = Number(el.getAttribute('width'));", "  if (el.hasAttribute('height')) options.height = Number(el.getAttribute('height'));", "  if (el.hasAttribute('fill')) options.fill = true;", "  if (el.hasAttribute('auto')) options.auto = el.getAttribute('auto') !== 'false';"], observed: ['width', 'height', 'fill', 'auto'], methods: "\n  start() { this.ctrl?.start(); }\n  stop() { this.ctrl?.stop(); }\n  reset() { this.ctrl?.reset(); }\n" },
  flipCard: { attrs: ["  if (el.hasAttribute('front-title')) options.frontTitle = el.getAttribute('front-title') ?? undefined;", "  if (el.hasAttribute('disabled')) options.disabled = true;"], observed: ['front-title', 'disabled'], methods: "\n  flip() { this.ctrl?.flip(); }\n  reset() { this.ctrl?.reset(); }\n" }
};

const dir = import.meta.dirname;

/** @type {Record<string, { types: string, engineFile: string, exposeMethods?: string[], elementParse?: string, observed?: string[], elementMethods?: string }>} */
export const BATCH_B_DEFS = {};

for (const name of BATCH_B) {
  const typesPath = join(dir, 'types', `${name}.ts`);
  const enginePath = join(dir, 'engines', `${name}.ts`);
  const exposeMethods = IMPERATIVE[name] ?? [];
  const el = ELEMENT_ATTRS[name];

  BATCH_B_DEFS[name] = {
    types: readFileSync(typesPath, 'utf8'),
    engineFile: `${name}.ts`,
    exposeMethods,
    elementParse: el?.attrs?.join('\n') ?? '',
    observed: el?.observed ?? [],
    elementMethods: el?.methods ?? ''
  };
}

export { BATCH_B, IMPERATIVE, toExportName };
