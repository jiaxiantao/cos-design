/**
 * 变更包检测与版本 bump 工具（供 release-changed 使用）
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { listComponentNames, PACKAGES_DIR, ROOT } from './component-packages.mjs';

export function runGit(args, { allowFail = false } = {}) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0 && !allowFail) {
    const err = (result.stderr || result.stdout || '').trim();
    throw new Error(`git ${args.join(' ')} failed${err ? `: ${err}` : ''}`);
  }
  return (result.stdout || '').trim();
}

/** 最近一次发布基线：优先同主版本 v* tag，其次 chore: release 提交 */
export function resolveBaseline(explicit) {
  if (explicit) return explicit;

  const rootMajor = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version.split('.')[0];
  const tags = runGit(['tag', '-l', `v${rootMajor}.*`, '--sort=-v:refname'], { allowFail: true })
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tags[0]) return tags[0];

  const releaseCommit = runGit(['log', '-1', '--grep=^chore: release', '--format=%H'], {
    allowFail: true
  });
  if (releaseCommit) return releaseCommit;

  return null;
}

export function listChangedFiles(baseline) {
  const files = new Set();
  const committed = runGit(['diff', '--name-only', `${baseline}...HEAD`], { allowFail: true });
  const unstaged = runGit(['diff', '--name-only'], { allowFail: true });
  const staged = runGit(['diff', '--name-only', '--cached'], { allowFail: true });
  // 未跟踪文件也要算进变更（本地改完尚未 git add 时）
  const untracked = runGit(['ls-files', '--others', '--exclude-standard'], { allowFail: true });
  for (const line of `${committed}\n${unstaged}\n${staged}\n${untracked}`.split('\n')) {
    if (line) files.add(line);
  }
  return [...files];
}

/**
 * 路径 → 包目录名。
 * policy 2A：shared 变更只映射到 shared，不扩散到依赖它的组件。
 */
export function mapFilesToPackageDirs(files) {
  const components = new Set(listComponentNames());
  const changed = new Set();

  for (const file of files) {
    const componentMatch = file.match(/^src\/components\/([^/]+)\//);
    if (componentMatch && components.has(componentMatch[1])) {
      changed.add(componentMatch[1]);
      continue;
    }

    if (file.startsWith('packages/shared/')) {
      changed.add('shared');
      continue;
    }

    if (
      file === 'src/index.ts' ||
      file === 'src/index.tsx' ||
      file === 'CHANGELOG.md' ||
      file === 'README.md' ||
      file.startsWith('packages/cos-design/')
    ) {
      changed.add('cos-design');
    }
  }

  return [...changed];
}

/** 有可发布内容时，始终带上聚合包 cos-design */
export function withUmbrella(packageDirs) {
  const set = new Set(packageDirs);
  if (set.size === 0) return [];
  set.add('cos-design');
  return [...set].sort((a, b) => {
    if (a === 'shared') return -1;
    if (b === 'shared') return 1;
    if (a === 'cos-design') return 1;
    if (b === 'cos-design') return -1;
    return a.localeCompare(b);
  });
}

export function bumpPatch(version) {
  const parts = String(version)
    .split('.')
    .map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    throw new Error(`Invalid semver: ${version}`);
  }
  parts[2] += 1;
  return parts.join('.');
}

export function readPkg(dirName) {
  const pkgPath = join(PACKAGES_DIR, dirName, 'package.json');
  return { pkgPath, pkg: JSON.parse(readFileSync(pkgPath, 'utf8')) };
}

export function writePkg(pkgPath, pkg) {
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export function packageLabel(dirName) {
  if (dirName === 'cos-design') return 'cos-design';
  if (dirName === 'shared') return '@cos-design/shared';
  return `@cos-design/${dirName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

export function prependChangelogWithBumps({ umbrellaVersion, bumps, date = new Date() }) {
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  if (!existsSync(changelogPath)) return;

  const iso = date.toISOString().slice(0, 10);
  const entries = bumps.filter((b) => b.dir !== 'cos-design');
  const body = [
    `## [${umbrellaVersion}] - ${iso}`,
    '',
    '### Changed',
    '',
    ...entries.map((b) => `- ${packageLabel(b.dir)}: ${b.from} → ${b.to}`),
    `- cos-design: 聚合包更新至 ${umbrellaVersion}`,
    '',
    ''
  ].join('\n');

  const content = readFileSync(changelogPath, 'utf8');
  const match = content.match(/\n## \[/);
  if (!match) {
    writeFileSync(changelogPath, `${content.trimEnd()}\n\n${body}`);
    return;
  }
  const at = content.indexOf(match[0]) + 1;
  writeFileSync(changelogPath, `${content.slice(0, at)}${body}${content.slice(at)}`);
}
