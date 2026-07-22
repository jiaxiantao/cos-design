#!/usr/bin/env node
/**
 * 构建 shared、各组件包与聚合包 cos-design。
 * 用法：node scripts/build-packages.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PACKAGES_DIR,
  ROOT,
  componentUsesShared,
  listComponentNames,
  packageNameOf,
  toExportName
} from './component-packages.mjs';

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

function writeTypesEntry(name) {
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

function writeSharedTypesEntry() {
  const distDir = join(PACKAGES_DIR, 'shared', 'dist');
  const nested = join(distDir, 'packages/shared/src/index.d.ts');
  const content = existsSync(nested)
    ? readFileSync(nested, 'utf8')
    : [
        'export declare const bindVisibilityPause: (onChange: (paused: boolean) => void) => () => void;',
        'export declare const clamp: (value: number, min: number, max: number) => number;',
        ''
      ].join('\n');
  writeFileSync(join(distDir, 'index.d.ts'), content);
}

function writeUmbrellaTypesEntry() {
  const distDir = join(PACKAGES_DIR, 'cos-design', 'dist');
  const nested = join(distDir, 'src/index.d.ts');
  if (existsSync(nested)) {
    writeFileSync(
      join(distDir, 'index.d.ts'),
      "export * from './src';\n"
    );
  }
}

async function buildPackage(name, { usesShared = false } = {}) {
  await run(
    'pnpm',
    ['exec', 'vite', 'build', '--config', VITE_CONFIG],
    {
      COS_PACKAGE: name,
      COS_PACKAGE_USES_SHARED: usesShared ? '1' : ''
    }
  );
  if (name === 'shared') writeSharedTypesEntry();
  else writeTypesEntry(name);
  const label = name === 'shared' ? '@cos-design/shared' : packageNameOf(name);
  console.log(`  ✓ ${label}`);
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
    await buildPackage(name, { usesShared: componentUsesShared(name) });
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
