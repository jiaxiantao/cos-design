/**
 * 根据 src/components 同步生成 packages/<name>/package.json 与入口文件。
 * v4 组件（含 core/index.ts）生成 react / vue / core / element 四入口。
 * 用法：node scripts/sync-packages.mjs
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EXTRA_EXPORTS,
  PACKAGES_DIR,
  ROOT,
  VERSION,
  componentPeerDeps,
  componentUsesShared,
  listComponentNames,
  packageNameOf,
  toExportName
} from './component-packages.mjs';
import { isV4Component } from './v4-utils.mjs';
import { v4ExportMap, v4PeerDependencies, writeV4PackageEntries } from './v4-package-exports.mjs';
import { writeUmbrellaEntries } from './generate-umbrella-entries.mjs';

const AI_KEYWORDS = [
  'cos',
  'cos-design',
  'react',
  'vue',
  'web-components',
  'component-library',
  'visual-effects',
  'canvas',
  'animation',
  'fireworks',
  'confetti',
  'scratch-card',
  'lottery',
  'turntable',
  'matrix-rain',
  'weather-background',
  'neon-text',
  'marketing-page',
  'landing-page',
  'campaign',
  'typescript',
  'vite'
];

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

function legacyExports() {
  return {
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
  };
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
  // v4.0：全量对齐根版本号
  const version = VERSION;
  const v4 = isV4Component(name);

  if (v4) {
    writeV4PackageEntries(name, srcDir, exportName, extra);
  } else {
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
  }

  const extraPeers = componentPeerDeps(name);
  const { peers, peerDependenciesMeta } = v4
    ? v4PeerDependencies(extraPeers || undefined)
    : {
        peers: {
          react: '>=18.0.0',
          'react-dom': '>=18.0.0',
          ...(extraPeers || {})
        },
        peerDependenciesMeta: undefined
      };

  const pkg = {
    name: packageNameOf(name),
    version,
    description: `${exportName} component from cos-design`,
    type: 'module',
    main: v4 ? './dist/react/index.cjs' : './dist/index.cjs',
    module: v4 ? './dist/react/index.js' : './dist/index.js',
    types: v4 ? './dist/react/index.d.ts' : './dist/index.d.ts',
    exports: v4 ? v4ExportMap() : legacyExports(),
    files: ['dist', 'LICENSE'],
    sideEffects: v4
      ? ['**/*.css', '**/*.less', './dist/element/index.js']
      : ['**/*.css', '**/*.less'],
    keywords: ['cos-design', 'react', 'vue', name, exportName],
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
    peerDependencies: peers,
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org'
    }
  };

  if (peerDependenciesMeta) {
    pkg.peerDependenciesMeta = peerDependenciesMeta;
  }

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
  writeUmbrellaEntries();

  const pkg = {
    name: 'cos-design',
    version: VERSION,
    description:
      'Multi-framework visual-effect components for marketing pages, campaigns, canvas backgrounds, and creative showcases (React / Vue / Web Components)',
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
      },
      './vue': {
        import: {
          types: './dist/vue.d.ts',
          default: './dist/vue.js'
        }
      },
      './core': {
        import: {
          types: './dist/core.d.ts',
          default: './dist/core.js'
        }
      },
      './elements': {
        import: {
          types: './dist/elements.d.ts',
          default: './dist/elements.js'
        }
      }
    },
    files: ['dist', 'LICENSE', 'README.md', 'CHANGELOG.md'],
    sideEffects: ['**/*.css', '**/*.less', './dist/elements.js'],
    keywords: AI_KEYWORDS,
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
      'react-dom': '>=18.0.0',
      vue: '>=3.4.0',
      three: '>=0.160.0'
    },
    peerDependenciesMeta: {
      react: { optional: true },
      'react-dom': { optional: true },
      vue: { optional: true },
      three: { optional: true }
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
sharedPkg.version = VERSION;
sharedPkg.exports = {
  '.': {
    import: {
      types: './dist/index.d.ts',
      default: './dist/index.js'
    },
    require: {
      types: './dist/index.d.ts',
      default: './dist/index.cjs'
    }
  },
  './react': {
    import: {
      types: './dist/react/index.d.ts',
      default: './dist/react/index.js'
    }
  }
};
sharedPkg.peerDependencies = {
  react: '>=18.0.0'
};
sharedPkg.peerDependenciesMeta = {
  react: { optional: true }
};

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

const v4Count = names.filter(isV4Component).length;
const uniqueVersions = new Set([
  VERSION,
  sharedPkg.version,
  ...names.map((n) => readExistingVersion(join(PACKAGES_DIR, n, 'package.json'), VERSION))
]);
console.log(
  `Synced ${names.length} component packages + shared + cos-design (v4=${v4Count}; root=${VERSION}; versions=${[...uniqueVersions].sort().join(', ')})`
);
