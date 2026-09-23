import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(fileURLToPath(import.meta.url), '../..');

/**
 * v4 exports 字段（不含 sideEffects，sideEffects 单独写在 package.json）
 */
export function v4ExportMap() {
  return {
    '.': {
      import: {
        types: './dist/react/index.d.ts',
        default: './dist/react/index.js',
      },
      require: {
        types: './dist/react/index.d.ts',
        default: './dist/react/index.cjs',
      },
    },
    './vue': {
      import: {
        types: './dist/vue/index.d.ts',
        default: './dist/vue/index.js',
      },
    },
    './core': {
      import: {
        types: './dist/core/index.d.ts',
        default: './dist/core/index.js',
      },
    },
    './element': {
      import: {
        types: './dist/element/index.d.ts',
        default: './dist/element/index.js',
      },
    },
  };
}

export function v4PeerDependencies(extra = null) {
  const peers = {
    react: '>=18.0.0',
    'react-dom': '>=18.0.0',
    vue: '>=3.4.0',
    ...(extra || {}),
  };
  return {
    peers,
    peerDependenciesMeta: {
      react: { optional: true },
      'react-dom': { optional: true },
      vue: { optional: true },
    },
  };
}

/**
 * 生成 v4 组件包 src 入口文件
 */
export function writeV4PackageEntries(name, srcDir, exportName, extra) {
  const componentPath = `../../../src/components/${name}`;
  const lines = {
    react: [
      `export { default } from '${componentPath}/react';`,
      `export { default as ${exportName} } from '${componentPath}/react';`,
      `export type * from '${componentPath}/core/types';`,
    ],
    vue: [
      `export { default as ${exportName} } from '${componentPath}/vue/${exportName}.vue';`,
      `export type * from '${componentPath}/core/types';`,
    ],
    core: [`export * from '${componentPath}/core';`],
    element: [`export * from '${componentPath}/element';`],
  };

  if (extra) {
    lines.react.push(...extraExportLines(componentPath, extra));
  }

  const written = [];
  for (const [entry, content] of Object.entries(lines)) {
    const filePath = join(srcDir, `${entry}.ts`);
    writeFileSync(filePath, `${content.join('\n')}\n`);
    written.push(filePath);
  }

  // EXTRA_EXPORTS 容易触发 printWidth 差异；用 prettier 固定格式，避免 sync 反复改写。
  if (extra) {
    const prettierBin = join(REPO_ROOT, 'node_modules/prettier/bin/prettier.cjs');
    const reactEntry = written.find(
      (p) => p.endsWith(`${join('src', 'react.ts')}`) || p.endsWith('/react.ts'),
    );
    if (reactEntry && existsSync(prettierBin)) {
      try {
        execFileSync(process.execPath, [prettierBin, '--write', reactEntry], { stdio: 'ignore' });
      } catch {
        // prettier optional during bootstrap
      }
    }
  }
}

/** EXTRA_EXPORTS 按 from 分组，生成具名 export 行（多符号时换行，避免 prettier 反复改写） */
export function extraExportLines(componentPath, extra) {
  const fromLive = extra.from || {};
  const byFrom = new Map();
  const lines = [];

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

  const formatNamedExport = (kind, names, fromPath) => {
    if (names.length < 2) {
      return `export ${kind}{ ${names.join(', ')} } from '${fromPath}';`;
    }
    const body = names.map((n) => `  ${n},`).join('\n');
    return `export ${kind}{\n${body}\n} from '${fromPath}';`;
  };

  for (const [rel, group] of byFrom) {
    const base = `${componentPath}/${rel.replace(/^\.\//, '')}`;
    if (group.values.length) {
      lines.push(formatNamedExport('', group.values, base));
    }
    if (group.types.length) {
      lines.push(formatNamedExport('type ', group.types, base));
    }
  }
  return lines;
}
