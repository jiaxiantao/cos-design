#!/usr/bin/env node
/**
 * 构建 shared、各组件包与聚合包 cos-design。
 * v4 组件按 react → vue → core → element 顺序构建四入口。
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PACKAGES_DIR,
  ROOT,
  componentUsesShared,
  componentUsesThree,
  listComponentNames,
  packageNameOf,
  toExportName
} from './component-packages.mjs';
import { isV4Component, V4_ENTRIES } from './v4-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 4;
const VITE_CONFIG = join(__dirname, 'vite.component.config.mjs');

function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...env }
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} failed with code ${code}`));
    });
  });
}

async function mapPool(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

function writeLegacyTypesEntry(name) {
  const distDir = join(PACKAGES_DIR, name, 'dist');
  const exportName = toExportName(name);
  const componentDts = `./src/components/${name}/index`;
  const lines = [
    `export { default } from '${componentDts}';`,
    `export { default as ${exportName} } from '${componentDts}';`,
    `export type * from '${componentDts}';`
  ];

  const liveDts = join(distDir, 'src', 'components', name, 'live-weather.d.ts');
  if (existsSync(liveDts)) {
    lines.push(
      `export { mapWmoCodeToWeatherType, useLiveWeather } from './src/components/${name}/live-weather';`,
      `export type { LiveWeatherCoords, LiveWeatherState, LiveWeatherStatus, OpenMeteoCurrent } from './src/components/${name}/live-weather';`
    );
  }

  writeFileSync(join(distDir, 'index.d.ts'), `${lines.join('\n')}\n`);
}

function writeV4TypesEntry(name, entry) {
  const distDir = join(PACKAGES_DIR, name, 'dist', entry);
  const exportName = toExportName(name);
  const componentRoot = `./src/components/${name}`;

  if (entry === 'react') {
    writeFileSync(
      join(distDir, 'index.d.ts'),
      [
        `export { default } from '${componentRoot}/react';`,
        `export { default as ${exportName} } from '${componentRoot}/react';`,
        `export type * from '${componentRoot}/core/types';`,
        ''
      ].join('\n')
    );
    return;
  }

  if (entry === 'vue') {
    writeFileSync(
      join(distDir, 'index.d.ts'),
      [
        `export { default as ${exportName} } from '${componentRoot}/vue/${exportName}.vue';`,
        `export type * from '${componentRoot}/core/types';`,
        ''
      ].join('\n')
    );
    return;
  }

  if (entry === 'core') {
    writeFileSync(join(distDir, 'index.d.ts'), `export * from '${componentRoot}/core';\n`);
    return;
  }

  if (entry === 'element') {
    writeFileSync(join(distDir, 'index.d.ts'), `export * from '${componentRoot}/element';\n`);
  }
}

function writeSharedTypesEntry(entry) {
  const distDir =
    entry === 'react' ? join(PACKAGES_DIR, 'shared', 'dist', 'react') : join(PACKAGES_DIR, 'shared', 'dist');

  const nested =
    entry === 'react'
      ? join(distDir, 'packages/shared/src/react/index.d.ts')
      : join(distDir, 'packages/shared/src/index.d.ts');

  if (existsSync(nested)) {
    writeFileSync(join(distDir, 'index.d.ts'), readFileSync(nested, 'utf8'));
    return;
  }

  if (entry === 'react') {
    writeFileSync(
      join(distDir, 'index.d.ts'),
      [
        "export { useElementSize, useCanvasBox, resolveCanvasBoxSize } from './packages/shared/src/react/index';",
        "export type { UseElementSizeOptions, UseCanvasBoxOptions, UseCanvasBoxResult, CanvasBoxSizeInput, CanvasBoxSize } from './packages/shared/src/react/index';",
        ''
      ].join('\n')
    );
    return;
  }

  writeFileSync(
    join(distDir, 'index.d.ts'),
    [
      "export { clamp, lerp, bindVisibilityPause, prefersReducedMotion, bindPrefersReducedMotion, observeElementSize, getRelativePointerPosition, resolveCanvasBoxSize } from './packages/shared/src/index';",
      "export type { ElementSize, PointerPosition, PhotoItem, PhotoIndexChangeHandler, PhotoFaceChangeHandler, CanvasBoxSizeInput, CanvasBoxSize } from './packages/shared/src/index';",
      ''
    ].join('\n')
  );
}

function writeUmbrellaTypesEntry() {
  const distDir = join(PACKAGES_DIR, 'cos-design', 'dist');
  const nested = join(distDir, 'src/index.d.ts');
  if (existsSync(nested)) {
    writeFileSync(join(distDir, 'index.d.ts'), "export * from './src';\n");
  }
}

async function buildPackageEntry(name, entry, { usesShared = false, usesThree = false, emptyOutDir = false } = {}) {
  await run(
    'pnpm',
    ['exec', 'vite', 'build', '--config', VITE_CONFIG],
    {
      COS_PACKAGE: name,
      COS_ENTRY: entry,
      COS_PACKAGE_USES_SHARED: usesShared ? '1' : '',
      COS_PACKAGE_USES_THREE: usesThree ? '1' : '',
      COS_EMPTY_OUT_DIR: emptyOutDir ? '1' : ''
    }
  );
}

async function buildPackage(name, opts = {}) {
  const v4 = isV4Component(name);

  if (name === 'shared') {
    const distRoot = join(PACKAGES_DIR, 'shared', 'dist');
    if (existsSync(distRoot)) rmSync(distRoot, { recursive: true, force: true });
    await buildPackageEntry('shared', 'default', { emptyOutDir: true });
    writeSharedTypesEntry('default');
    await buildPackageEntry('shared', 'react', { emptyOutDir: true });
    writeSharedTypesEntry('react');
    console.log('  ✓ @cos-design/shared (+ /react)');
    return;
  }

  if (v4) {
    const distRoot = join(PACKAGES_DIR, name, 'dist');
    if (existsSync(distRoot)) rmSync(distRoot, { recursive: true, force: true });
    mkdirSync(distRoot, { recursive: true });

    for (let i = 0; i < V4_ENTRIES.length; i += 1) {
      const entry = V4_ENTRIES[i];
      await buildPackageEntry(name, entry, { ...opts, emptyOutDir: true });
      writeV4TypesEntry(name, entry);
    }

    console.log(`  ✓ ${packageNameOf(name)} (v4: react/vue/core/element)`);
    return;
  }

  await buildPackageEntry(name, 'legacy', { ...opts, emptyOutDir: true });
  writeLegacyTypesEntry(name);
  console.log(`  ✓ ${packageNameOf(name)}`);
}

async function main() {
  await run('node', [join(__dirname, 'sync-packages.mjs')]);

  console.log('\n▶ Typecheck');
  await run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.json', '--noEmit']);

  console.log('\n▶ Building @cos-design/shared');
  await buildPackage('shared');

  const names = listComponentNames();
  console.log(`\n▶ Building ${names.length} component packages (concurrency=${CONCURRENCY})`);
  await mapPool(names, CONCURRENCY, async (name) => {
    await buildPackage(name, {
      usesShared: componentUsesShared(name),
      usesThree: componentUsesThree(name)
    });
  });

  console.log('\n▶ Building cos-design (umbrella)');
  mkdirSync(join(PACKAGES_DIR, 'cos-design'), { recursive: true });
  await run('pnpm', ['exec', 'vite', 'build', '--mode', 'lib']);
  writeUmbrellaTypesEntry();

  console.log('\n✅ All packages built');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
