import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { isV4Component } from './v4-utils.mjs';

const name = process.env.COS_PACKAGE;
const entryKind = process.env.COS_ENTRY || 'legacy';

if (!name) {
  throw new Error('COS_PACKAGE env is required');
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isShared = name === 'shared';
const usesShared = process.env.COS_PACKAGE_USES_SHARED === '1';
const usesThree = process.env.COS_PACKAGE_USES_THREE === '1';
const v4 = !isShared && isV4Component(name);

function resolveEntry() {
  if (isShared) {
    if (entryKind === 'react') {
      return resolve(root, 'packages/shared/src/react/index.ts');
    }
    return resolve(root, 'packages/shared/src/index.ts');
  }

  if (v4) {
    const entry = entryKind === 'legacy' ? 'react' : entryKind;
    return resolve(root, `packages/${name}/src/${entry}.ts`);
  }

  return resolve(root, `packages/${name}/src/index.ts`);
}

function resolveOutDir() {
  if (isShared) {
    return entryKind === 'react'
      ? resolve(root, 'packages/shared/dist/react')
      : resolve(root, 'packages/shared/dist');
  }

  if (v4 && entryKind !== 'legacy') {
    return resolve(root, `packages/${name}/dist/${entryKind}`);
  }

  return resolve(root, `packages/${name}/dist`);
}

const entry = resolveEntry();
const outDir = resolveOutDir();
const esOnly = v4 && entryKind !== 'react' && entryKind !== 'legacy';
const formats = isShared && entryKind === 'react' ? ['es'] : esOnly ? ['es'] : ['es', 'cjs'];

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'vue',
  ...(usesShared || isShared || (v4 && entryKind === 'core') ? ['@cos-design/shared'] : []),
  ...(usesThree ? ['three'] : [])
];

const injectCss = !isShared && entryKind !== 'core';

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    vue(),
    ...(injectCss ? [libInjectCss()] : []),
    dts({
      include: isShared
        ? entryKind === 'react'
          ? ['packages/shared/src/react']
          : ['packages/shared/src']
        : [
            `packages/${name}/src`,
            `src/components/${name}`,
            'src/vite-env.d.ts',
            ...(usesShared || v4 ? ['packages/shared/src'] : [])
          ],
      exclude: ['src/main.tsx', 'src/pages'],
      outDir,
      entryRoot: root,
      rollupTypes: false,
      copyDtsFiles: true,
      tsconfigPath: resolve(root, 'tsconfig.build.json')
    })
  ],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      '@cos-design/shared': resolve(root, 'packages/shared/src/index.ts'),
      '@cos-design/shared/react': resolve(root, 'packages/shared/src/react/index.ts')
    }
  },
  css: {
    modules: {
      generateScopedName: 'cos-[local]-[hash:base64:5]'
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  build: {
    lib: {
      entry,
      name: isShared
        ? entryKind === 'react'
          ? 'CosDesignSharedReact'
          : 'CosDesignShared'
        : `CosDesign${name[0].toUpperCase()}${name.slice(1)}${entryKind === 'legacy' || entryKind === 'react' ? '' : entryKind[0].toUpperCase() + entryKind.slice(1)}`,
      formats,
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          vue: 'Vue',
          three: 'THREE',
          '@cos-design/shared': 'CosDesignShared'
        }
      }
    },
    outDir,
    emptyOutDir: process.env.COS_EMPTY_OUT_DIR === '1'
  }
});
