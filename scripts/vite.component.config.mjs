import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

const name = process.env.COS_PACKAGE;
if (!name) {
  throw new Error('COS_PACKAGE env is required');
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isShared = name === 'shared';
const usesShared = process.env.COS_PACKAGE_USES_SHARED === '1';
const entry = isShared
  ? resolve(root, 'packages/shared/src/index.ts')
  : resolve(root, `packages/${name}/src/index.ts`);
const outDir = resolve(root, `packages/${name}/dist`);
const external =
  isShared || !usesShared
    ? ['react', 'react-dom', 'react/jsx-runtime']
    : ['react', 'react-dom', 'react/jsx-runtime', '@cos-design/shared'];

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    ...(isShared ? [] : [libInjectCss()]),
    dts({
      include: isShared
        ? ['packages/shared/src']
        : [
            `packages/${name}/src`,
            `src/components/${name}`,
            'src/vite-env.d.ts',
            ...(usesShared ? ['packages/shared/src'] : [])
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
      '@cos-design/shared': resolve(root, 'packages/shared/src/index.ts')
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
        ? 'CosDesignShared'
        : `CosDesign${name[0].toUpperCase()}${name.slice(1)}`,
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    outDir,
    emptyOutDir: true
  }
});
