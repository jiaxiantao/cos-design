/**
 * 发布 packages/*；若某版本已存在则跳过。
 * 配合「只发变更组件」：未 bump 的子包版本仍在 npm 上，会被自动 skip。
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

const planned = [];

for (const dir of dirs) {
  const pkgPath = join(packagesDir, dir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const { name, version } = pkg;

  if (packageExists(name, version)) {
    console.log(`⏭  skip ${name}@${version} (already on npm)`);
    skipped++;
    continue;
  }

  planned.push({ dir, name, version });
}

if (planned.length === 0) {
  console.log('\nNothing to publish.');
  process.exit(0);
}

console.log(`\nWill publish ${planned.length} package(s):`);
for (const item of planned) console.log(`  - ${item.name}@${item.version}`);
console.log('');

for (const { dir, name, version } of planned) {
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
