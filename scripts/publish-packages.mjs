/**
 * 发布 packages/*；若某版本已存在则跳过。
 * 配合「只发变更组件」：未 bump 的子包版本仍在 npm 上，会被自动 skip。
 *
 * 认证只走 npm Trusted Publishing（OIDC）。调用 npm publish（不用 pnpm publish），
 * 这样 ACTIONS_ID_TOKEN_REQUEST_* 能进到真正发 PUT 的进程。
 * 不要设置 NODE_AUTH_TOKEN，也不要在 .npmrc 写 _authToken：npm 会把它当成已配置的
 * token，跳过 OIDC，匿名 PUT 在 registry 上表现为 E404。
 * Provenance 在公开仓库的 trusted publishing 下自动附带，不要传 --provenance。
 *
 * pnpm 的 workspace:* 不能留给 registry。发包前改成具体版本（与 `pnpm publish`
 * 相同：workspace:* → 精确版本），结束后把 package.json 写回去。
 * npm 11 已去掉 git-checks，不再传 --no-git-checks（该参数会告警，且 artifact
 * 覆盖 packages/ 后工作区本来就不干净）。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT } from './component-packages.mjs';

const packagesDir = join(ROOT, 'packages');
const DEP_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const MIN_NPM = [11, 5, 1];

export function publishEnv(base = process.env) {
  const env = { ...base };
  for (const key of Object.keys(env)) {
    if (key === 'NPM_TOKEN' || /auth.?token/i.test(key)) delete env[key];
  }
  delete env.NPM_CONFIG_PROVENANCE;
  delete env.npm_config_provenance;
  return env;
}

export function rewriteWorkspaceSpec(spec, version) {
  const range = spec.slice('workspace:'.length);
  if (range === '*' || range === '') return version;
  if (range === '^' || range === '~') return `${range}${version}`;
  return range;
}

export function rewriteWorkspaceDeps(pkg, versions) {
  let changed = false;
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec !== 'string' || !spec.startsWith('workspace:')) continue;
      const version = versions.get(name);
      if (!version) {
        throw new Error(`Cannot resolve ${name}@${spec}: package is not in packages/`);
      }
      deps[name] = rewriteWorkspaceSpec(spec, version);
      changed = true;
    }
  }
  return changed;
}

export function orderForPublish(planned) {
  const byName = new Map(planned.map((item) => [item.name, item]));
  const depsOf = new Map();
  for (const item of planned) {
    const deps = [];
    for (const field of DEP_FIELDS) {
      for (const [name, spec] of Object.entries(item.pkg[field] ?? {})) {
        if (typeof spec === 'string' && spec.startsWith('workspace:') && byName.has(name)) {
          deps.push(name);
        }
      }
    }
    depsOf.set(item.name, deps);
  }

  const done = new Set();
  const ordered = [];
  const remaining = [...planned].sort((a, b) => a.name.localeCompare(b.name));
  while (remaining.length) {
    const index = remaining.findIndex((item) => depsOf.get(item.name).every((dep) => done.has(dep)));
    if (index === -1) {
      ordered.push(...remaining);
      break;
    }
    const [item] = remaining.splice(index, 1);
    done.add(item.name);
    ordered.push(item);
  }
  return ordered;
}

function npmrcCandidates() {
  const files = [join(ROOT, '.npmrc')];
  if (process.env.NPM_CONFIG_USERCONFIG) files.push(process.env.NPM_CONFIG_USERCONFIG);
  if (process.env.NPM_CONFIG_GLOBALCONFIG) files.push(process.env.NPM_CONFIG_GLOBALCONFIG);
  files.push(join(homedir(), '.npmrc'));
  return files;
}

function npmrcHasRegistryToken(file) {
  const text = readFileSync(file, 'utf8');
  return text.split(/\r?\n/).some((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) return false;
    return /_authToken\s*=/.test(trimmed) || /^_auth\s*=/.test(trimmed);
  });
}

export function registryTokenFiles() {
  const seen = new Set();
  const hits = [];
  for (const file of npmrcCandidates()) {
    if (!file || seen.has(file)) continue;
    seen.add(file);
    if (!existsSync(file)) continue;
    if (npmrcHasRegistryToken(file)) hits.push(file);
  }
  return hits;
}

function assertNoRegistryToken() {
  const hits = registryTokenFiles();
  if (hits.length === 0) return true;
  console.error(
    'Refusing to publish: an .npmrc _authToken is set, so npm would skip Trusted Publishing and PUT without OIDC.'
  );
  for (const file of hits) console.error(`  ${file}`);
  console.error('Remove the token line. Do not set registry-url or NODE_AUTH_TOKEN on the publish job.');
  return false;
}

function npmVersion() {
  const result = spawnSync('npm', ['--version'], { encoding: 'utf8', env: publishEnv() });
  if (result.error || result.status !== 0) return '';
  return result.stdout.trim();
}

function npmVersionAtLeast(version, minimum) {
  const parts = version.split('.').map((part) => Number.parseInt(part, 10));
  for (let i = 0; i < minimum.length; i++) {
    const current = parts[i] || 0;
    if (current > minimum[i]) return true;
    if (current < minimum[i]) return false;
  }
  return true;
}

function assertNpmSupportsTrustedPublishing() {
  const version = npmVersion();
  if (!version || !npmVersionAtLeast(version, MIN_NPM)) {
    console.error(
      `npm ${version || '(missing)'} cannot do Trusted Publishing. Need npm >= ${MIN_NPM.join('.')} (this job installs npm@11.21.3).`
    );
    return false;
  }
  console.log(`Using npm ${version} (Trusted Publishing / OIDC)`);
  return true;
}

function packageExists(name, version) {
  const result = spawnSync(
    'npm',
    ['view', `${name}@${version}`, 'version', '--registry', 'https://registry.npmjs.org'],
    { encoding: 'utf8', env: publishEnv() }
  );
  return result.status === 0 && result.stdout.trim() === version;
}

function loadPackages() {
  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return dirs.map((dir) => {
    const pkgPath = join(packagesDir, dir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return { dir, pkgPath, name: pkg.name, version: pkg.version, pkg };
  });
}

function withPublishManifest(item, versions, fn) {
  const original = readFileSync(item.pkgPath, 'utf8');
  const pkg = JSON.parse(original);
  const changed = rewriteWorkspaceDeps(pkg, versions);
  if (changed) writeFileSync(item.pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  try {
    return fn();
  } finally {
    if (changed) writeFileSync(item.pkgPath, original);
  }
}

function publishOne(item) {
  console.log(`▶ publish ${item.name}@${item.version}`);
  const result = spawnSync(
    'npm',
    [
      'publish',
      '--access',
      'public',
      '--ignore-scripts',
      '--registry',
      'https://registry.npmjs.org'
    ],
    {
      cwd: join(packagesDir, item.dir),
      env: publishEnv(),
      stdio: 'inherit'
    }
  );

  if (result.error || result.status !== 0) {
    console.error(`✗ failed ${item.name}@${item.version}`);
    return false;
  }
  return true;
}

function main() {
  if (!assertNpmSupportsTrustedPublishing()) return 1;

  const packages = loadPackages();
  const versions = new Map(packages.map((item) => [item.name, item.version]));

  let failed = 0;
  let published = 0;
  let skipped = 0;
  const planned = [];

  for (const item of packages) {
    if (packageExists(item.name, item.version)) {
      console.log(`⏭  skip ${item.name}@${item.version} (already on npm)`);
      skipped++;
      continue;
    }
    planned.push(item);
  }

  if (planned.length === 0) {
    console.log('\nNothing to publish.');
    console.log(`\nDone. published=${published} skipped=${skipped} failed=${failed}`);
    return 0;
  }

  if (!assertNoRegistryToken()) return 1;

  const queue = orderForPublish(planned);
  console.log(`\nWill publish ${queue.length} package(s):`);
  for (const item of queue) console.log(`  - ${item.name}@${item.version}`);
  console.log('');

  for (const item of queue) {
    let ok = false;
    try {
      ok = withPublishManifest(item, versions, () => publishOne(item));
    } catch (error) {
      console.error(`✗ failed ${item.name}@${item.version}: ${error instanceof Error ? error.message : error}`);
      ok = false;
    }
    if (ok) published++;
    else failed++;
  }

  console.log(`\nDone. published=${published} skipped=${skipped} failed=${failed}`);
  return failed > 0 ? 1 : 0;
}

function invokedDirectly() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return import.meta.url === pathToFileURL(entry).href;
  }
}

if (invokedDirectly()) {
  process.exit(main());
}
