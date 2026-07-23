/**
 * 根据 src/components 同步生成 packages/<name>/package.json 与入口文件。
 * 组件 / shared 保留已有版本号；聚合包 cos-design 与根目录 version 对齐。
 * 用法：node scripts/sync-packages.mjs
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EXTRA_EXPORTS,
  PACKAGES_DIR,
  ROOT,
  VERSION,
  componentUsesShared,
  listComponentNames,
  packageNameOf,
  toExportName
} from './component-packages.mjs';

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function readExistingVersion(pkgPath, fallback) {
  if (!existsSync(pkgPath)) return fallback;
  try {
    const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;
    return typeof version === 'string' && version ? version : fallback;
  } catch {
    return fallback;
  }
}

function createComponentPackage(name) {
  const dir = join(PACKAGES_DIR, name);
  const srcDir = join(dir, 'src');
  const pkgPath = join(dir, 'package.json');
  mkdirSync(srcDir, { recursive: true });

  const usesShared = componentUsesShared(name);
  const exportName = toExportName(name);
  const extra = EXTRA_EXPORTS[name];
  const componentPath = `../../../src/components/${name}`;
  const version = readExistingVersion(pkgPath, VERSION);

  const lines = [
    `export { default } from '${componentPath}';`,
    `export { default as ${exportName} } from '${componentPath}';`,
    `export type * from '${componentPath}';`
  ];

  if (extra) {
    const fromLive = extra.from || {};
    const byFrom = new Map();

    for (const value of extra.values || []) {
      const rel = fromLive[value] || '.';
      if (rel === '.') continue;
      if (!byFrom.has(rel)) byFrom.set(rel, { values: [], types: [] });
      byFrom.get(rel).values.push(value);
    }

    for (const typeName of extra.types || []) {
      const rel = fromLive[typeName] || '.';
      if (rel === '.') continue;
      if (!byFrom.has(rel)) byFrom.set(rel, { values: [], types: [] });
      byFrom.get(rel).types.push(typeName);
    }

    for (const [rel, group] of byFrom) {
      const base = `${componentPath}/${rel.replace(/^\.\//, '')}`;
      if (group.values.length) {
        lines.push(`export { ${group.values.join(', ')} } from '${base}';`);
      }
      if (group.types.length) {
        lines.push(`export type { ${group.types.join(', ')} } from '${base}';`);
      }
    }
  }

  writeFileSync(join(srcDir, 'index.ts'), `${lines.join('\n')}\n`);

  const pkg = {
    name: packageNameOf(name),
    version,
    description: `${exportName} component from cos-design`,
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        import: {
          types: './dist/index.d.ts',
          default: './dist/index.js'
        },
        require: {
          types: './dist/index.d.ts',
          default: './dist/index.cjs'
        }
      }
    },
    files: ['dist', 'LICENSE'],
    sideEffects: ['**/*.css', '**/*.less'],
    keywords: ['cos-design', 'react', name, exportName],
    homepage: 'https://jiaxiantao.github.io/cos-design/',
    bugs: {
      url: 'https://github.com/jiaxiantao/cos-design/issues'
    },
    repository: {
      type: 'git',
      url: 'git+https://github.com/jiaxiantao/cos-design.git',
      directory: `packages/${name}`
    },
    author: 'jiaxiantao <jiaxiantao@souche.com>',
    license: 'MIT',
    peerDependencies: {
      react: '>=18.0.0',
      'react-dom': '>=18.0.0'
    },
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org'
    }
  };

  if (usesShared) {
    pkg.dependencies = {
      '@cos-design/shared': 'workspace:*'
    };
  }

  writeJson(pkgPath, pkg);

  const licenseSrc = join(ROOT, 'LICENSE');
  if (existsSync(licenseSrc)) {
    cpSync(licenseSrc, join(dir, 'LICENSE'));
  }
}

function createUmbrellaPackage() {
  const dir = join(PACKAGES_DIR, 'cos-design');
  mkdirSync(dir, { recursive: true });

  const pkg = {
    name: 'cos-design',
    version: VERSION,
    description: 'A React component library built with Vite',
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        import: {
          types: './dist/index.d.ts',
          default: './dist/index.js'
        },
        require: {
          types: './dist/index.d.ts',
          default: './dist/index.cjs'
        }
      }
    },
    files: ['dist', 'LICENSE', 'README.md', 'CHANGELOG.md'],
    sideEffects: ['**/*.css', '**/*.less'],
    keywords: ['cos', 'cos-design', 'react', 'component-library', 'vite', 'typescript'],
    homepage: 'https://jiaxiantao.github.io/cos-design/',
    bugs: {
      url: 'https://github.com/jiaxiantao/cos-design/issues'
    },
    repository: {
      type: 'git',
      url: 'git+https://github.com/jiaxiantao/cos-design.git',
      directory: 'packages/cos-design'
    },
    author: 'jiaxiantao <jiaxiantao@souche.com>',
    license: 'MIT',
    peerDependencies: {
      react: '>=18.0.0',
      'react-dom': '>=18.0.0'
    },
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org'
    }
  };

  writeJson(join(dir, 'package.json'), pkg);

  for (const file of ['LICENSE', 'README.md', 'CHANGELOG.md']) {
    const src = join(ROOT, file);
    if (existsSync(src)) cpSync(src, join(dir, file));
  }
}

const sharedPkgPath = join(PACKAGES_DIR, 'shared', 'package.json');
const sharedPkg = JSON.parse(readFileSync(sharedPkgPath, 'utf8'));
sharedPkg.version = readExistingVersion(sharedPkgPath, VERSION);
const licenseSrc = join(ROOT, 'LICENSE');
if (existsSync(licenseSrc)) {
  cpSync(licenseSrc, join(PACKAGES_DIR, 'shared', 'LICENSE'));
}
writeJson(sharedPkgPath, sharedPkg);

const names = listComponentNames();
for (const name of names) {
  createComponentPackage(name);
}
createUmbrellaPackage();

const uniqueVersions = new Set([
  VERSION,
  sharedPkg.version,
  ...names.map((n) => readExistingVersion(join(PACKAGES_DIR, n, 'package.json'), VERSION))
]);
console.log(
  `Synced ${names.length} component packages + shared + cos-design (root/umbrella=${VERSION}; versions=${[...uniqueVersions].sort().join(', ')})`
);
