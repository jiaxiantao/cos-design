#!/usr/bin/env node
/**
 * 校验 v4 组件是否具备 core/react/vue/element 四端源码与构建产物。
 * 用法：node scripts/verify-v4-matrix.mjs
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, PACKAGES_DIR, listComponentNames } from './component-packages.mjs';
import { isV4Component, V4_ENTRIES } from './v4-utils.mjs';

const SOURCE_LAYERS = ['core/index.ts', 'react/index.tsx', 'element/index.ts'];

function vuePath(name) {
  const exportName = name.charAt(0).toUpperCase() + name.slice(1);
  return join(COMPONENTS_DIR, name, 'vue', `${exportName}.vue`);
}

const names = listComponentNames();
const v4Names = names.filter(isV4Component);
const errors = [];

for (const name of v4Names) {
  for (const layer of SOURCE_LAYERS) {
    const file = join(COMPONENTS_DIR, name, ...layer.split('/'));
    if (!existsSync(file)) {
      errors.push(`missing source: src/components/${name}/${layer}`);
    }
  }

  if (!existsSync(vuePath(name))) {
    errors.push(`missing source: src/components/${name}/vue/*.vue`);
  }

  for (const entry of V4_ENTRIES) {
    const pkgEntry = join(PACKAGES_DIR, name, 'src', `${entry}.ts`);
    if (!existsSync(pkgEntry)) {
      errors.push(`missing package entry: packages/${name}/src/${entry}.ts`);
    }

    const distJs = join(PACKAGES_DIR, name, 'dist', entry, 'index.js');
    if (!existsSync(distJs)) {
      errors.push(`missing dist: packages/${name}/dist/${entry}/index.js (run pnpm build)`);
    }
  }
}

console.log(`v4 components: ${v4Names.length} / ${names.length}`);
if (v4Names.length) {
  console.log(`  ${v4Names.join(', ')}`);
}

if (errors.length) {
  console.error('\n❌ verify:v4-matrix failed:\n');
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log('\n✅ v4 matrix OK');
