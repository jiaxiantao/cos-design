import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';
  const isPages = mode === 'pages';

  return {
    base: isPages ? '/cos-design/' : '/',
    publicDir: isLib ? false : 'public',
    plugins: isLib
      ? [
          react(),
          libInjectCss(),
          dts({
            include: ['src'],
            exclude: ['src/main.tsx', 'src/pages'],
            outDir: 'packages/cos-design/dist',
            rollupTypes: false,
            copyDtsFiles: true,
            entryRoot: '.',
          }),
        ]
      : [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@cos-design/shared': resolve(__dirname, 'packages/shared/src/index.ts'),
      },
    },
    css: {
      modules: {
        generateScopedName: 'cos-[local]-[hash:base64:5]',
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      port: 4000,
      open: true,
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'CosDesign',
            formats: ['es', 'cjs'],
            fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
          },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime', 'three'],
            output: {
              exports: 'named',
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                three: 'THREE',
              },
            },
          },
          outDir: 'packages/cos-design/dist',
          emptyOutDir: true,
        }
      : isPages
        ? {
            outDir: 'dist-pages',
            emptyOutDir: true,
          }
        : {
            outDir: 'dist-demo',
            emptyOutDir: true,
          },
  };
});
