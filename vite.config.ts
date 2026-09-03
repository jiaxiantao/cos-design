import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
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
          vue(),
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
        '@cos-design/shared/react': resolve(__dirname, 'packages/shared/src/react/index.ts'),
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
            entry: {
              index: resolve(__dirname, 'src/index.ts'),
              vue: resolve(__dirname, 'src/vue.ts'),
              core: resolve(__dirname, 'src/core.ts'),
              elements: resolve(__dirname, 'src/elements.ts'),
            },
            name: 'CosDesign',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) =>
              format === 'es' ? `${entryName}.js` : `${entryName}.cjs`,
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              'vue',
              'three',
              '@cos-design/shared',
            ],
            output: {
              exports: 'named',
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                vue: 'Vue',
                three: 'THREE',
                '@cos-design/shared': 'CosDesignShared',
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
