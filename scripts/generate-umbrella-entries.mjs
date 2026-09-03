#!/usr/bin/env node
/**
 * 生成聚合包多框架入口：src/vue.ts / src/core.ts / src/elements.ts
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, listComponentNames, toExportName } from './component-packages.mjs';

export function writeUmbrellaEntries() {
  const names = listComponentNames();
  const vueLines = [];
  const coreLines = [];
  const elementLines = [
    '/** Side-effect: register all cos-* custom elements */',
    '',
  ];

  for (const name of names) {
    const exportName = toExportName(name);
    vueLines.push(
      `export { default as ${exportName} } from './components/${name}/vue/${exportName}.vue';`,
    );
    coreLines.push(`export * from './components/${name}/core';`);
    elementLines.push(`import './components/${name}/element';`);
  }

  writeFileSync(join(ROOT, 'src/vue.ts'), `${vueLines.join('\n')}\n`);
  writeFileSync(join(ROOT, 'src/core.ts'), `${coreLines.join('\n')}\n`);
  writeFileSync(join(ROOT, 'src/elements.ts'), `${elementLines.join('\n')}\n`);

  return names.length;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const n = writeUmbrellaEntries();
  console.log(`Generated umbrella entries for ${n} components`);
}
