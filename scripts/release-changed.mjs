/**
 * 只发布变更组件：
 * 1. 对比上次 v* tag（或 chore: release 提交）自动检测变更包
 * 2. patch bump 变更子包 + 主包 cos-design
 *    （shared 变更不扩散到依赖它的组件，policy 2A）
 * 3. 同步 package 元数据并更新 CHANGELOG
 *
 * 用法：
 *   pnpm release
 *   pnpm release -- --dry-run
 *   pnpm release -- --since=v3.5.3
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './component-packages.mjs';
import {
  bumpPatch,
  listChangedFiles,
  mapFilesToPackageDirs,
  packageLabel,
  prependChangelogWithBumps,
  readPkg,
  resolveBaseline,
  withUmbrella,
  writePkg
} from './release-utils.mjs';

function parseArgs(argv) {
  const opts = { dryRun: false, since: null };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--since=')) opts.since = arg.slice('--since='.length);
  }
  return opts;
}

function readRootVersion() {
  return JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
}

function writeRootVersion(version) {
  const rootPath = join(ROOT, 'package.json');
  const root = JSON.parse(readFileSync(rootPath, 'utf8'));
  root.version = version;
  writeFileSync(rootPath, `${JSON.stringify(root, null, 2)}\n`);
}

function resolveTargets(baseline) {
  const files = listChangedFiles(baseline);
  const detected = mapFilesToPackageDirs(files);
  // shared / 组件变更 → 必定带上 cos-design；仅文档/入口变更也能单独发主包
  const contentDirs = detected.filter((d) => d !== 'cos-design');
  if (contentDirs.length > 0) return withUmbrella(contentDirs);
  if (detected.includes('cos-design')) return ['cos-design'];
  return [];
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const baseline = resolveBaseline(opts.since);

  if (!baseline) {
    const current = readRootVersion();
    console.error(`No release baseline found.

Create a starting tag for the current published version, then retry:
  git tag v${current}
  git push origin v${current}

Or pass an explicit baseline:
  pnpm release -- --since=v${current}`);
    process.exit(1);
  }

  console.log(`Baseline: ${baseline}`);
  const packageDirs = resolveTargets(baseline);

  if (packageDirs.length === 0) {
    console.log('No publishable package changes detected since baseline.');
    process.exit(0);
  }

  console.log('Packages to release:');
  for (const dir of packageDirs) console.log(`  - ${packageLabel(dir)}`);

  if (opts.dryRun) {
    console.log('\nDry run only — no files modified.');
    process.exit(0);
  }

  const bumps = [];

  for (const dir of packageDirs) {
    if (dir === 'cos-design') continue;
    const { pkgPath, pkg } = readPkg(dir);
    const from = pkg.version;
    const to = bumpPatch(from);
    pkg.version = to;
    writePkg(pkgPath, pkg);
    bumps.push({ dir, from, to });
    console.log(`Bump ${packageLabel(dir)}: ${from} → ${to}`);
  }

  const rootFrom = readRootVersion();
  const umbrellaTo = bumpPatch(rootFrom);
  writeRootVersion(umbrellaTo);
  bumps.push({ dir: 'cos-design', from: rootFrom, to: umbrellaTo });
  console.log(`Bump cos-design / root: ${rootFrom} → ${umbrellaTo}`);

  prependChangelogWithBumps({ umbrellaVersion: umbrellaTo, bumps });

  const sync = spawnSync(process.execPath, [join(ROOT, 'scripts/sync-packages.mjs')], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  if ((sync.status ?? 1) !== 0) process.exit(sync.status ?? 1);

  console.log(`
Done. Next steps:
  1. Review CHANGELOG.md and version bumps
  2. git add -A && git commit -m "chore: release v${umbrellaTo}"
  3. git push origin HEAD

CI will publish only packages whose versions are not yet on npm, then tag v${umbrellaTo}.
`);
}

main();
