#!/usr/bin/env node
/**
 * 发布 packages/*；若某版本已存在则跳过，避免部分成功后重跑整批失败。
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './component-packages.mjs';

const packagesDir = join(ROOT, 'packages');
const dirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

function packageExists(name, version) {
  const result = spawnSync(
    'npm',
    ['view', `${name}@${version}`, 'version', '--registry', 'https://registry.npmjs.org'],
    { encoding: 'utf8' }
  );
  return result.status === 0 && result.stdout.trim() === version;
}

let failed = 0;
let published = 0;
let skipped = 0;

for (const dir of dirs) {
  const pkgPath = join(packagesDir, dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const { name, version } = pkg;

  if (packageExists(name, version)) {
    console.log(`⏭  skip ${name}@${version} (already on npm)`);
    skipped++;
    continue;
  }

  console.log(`▶ publish ${name}@${version}`);
  const result = spawnSync(
    'pnpm',
    ['publish', '--access', 'public', '--no-git-checks', '--provenance', '--ignore-scripts'],
    {
      cwd: join(packagesDir, dir),
      encoding: 'utf8',
      env: process.env,
      stdio: 'inherit'
    }
  );

  if (result.status !== 0) {
    console.error(`✗ failed ${name}@${version}`);
    failed++;
  } else {
    published++;
  }
}

console.log(`\nDone. published=${published} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);
