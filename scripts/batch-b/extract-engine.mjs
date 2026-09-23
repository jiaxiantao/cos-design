#!/usr/bin/env node
/**
 * Generate v4 core/engine.ts from existing React index.tsx for Batch B components.
 * Converts useCanvasBox / useElementSize patterns to vanilla observeElementSize.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, toExportName } from '../component-packages.mjs';

const COMPONENTS = process.argv.slice(2);
if (!COMPONENTS.length) {
  console.error('Usage: node scripts/batch-b/extract-engine.mjs <component> [...]');
  process.exit(1);
}

for (const name of COMPONENTS) {
  const indexPath = join(COMPONENTS_DIR, name, 'index.tsx');
  if (!existsSync(indexPath)) {
    console.error(`Missing ${indexPath}`);
    continue;
  }
  const src = readFileSync(indexPath, 'utf8');
  const exportName = toExportName(name);
  const prefix = `cos-${name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`;

  // Extract Props interface block
  const propsMatch = src.match(/export interface (\w+Props)\s*\{([\s\S]*?)\n\}/);
  const propsBody = propsMatch ? propsMatch[2] : '';
  const optionsName = `${exportName}Options`;

  const typesTs = `export interface ${optionsName} {${propsBody}
}

export interface ${exportName}Controller {
  update(options: Partial<${optionsName}>): void;
  destroy(): void;
}

export type ${exportName}Props = ${optionsName};
`;

  const outDir = join(COMPONENTS_DIR, name, 'core');
  mkdirSync(outDir, { recursive: true });

  // Write types only — engine must be hand-finished or from defs
  writeFileSync(join(outDir, 'types.ts'), typesTs);
  console.log(`Extracted types for ${name}`);
}
