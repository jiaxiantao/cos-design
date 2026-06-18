import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    publicDir: isLib ? false : 'public',
    plugins: isLib
      ? [
          react(),
          libInjectCss(),
          dts({
            include: ['src'],
            exclude: ['src/main.tsx', 'src/pages'],
            outDir: 'dist',
            rollupTypes: true
          })
        ]
      : [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      modules: {
        generateScopedName: 'cos-[local]'
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    server: {
      port: 4000,
      open: true
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'CosDesign',
            formats: ['es', 'cjs'],
            fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
          },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
              }
            }
          },
          outDir: 'dist',
          emptyOutDir: true
        }
      : {
          outDir: 'dist-demo',
          emptyOutDir: true
        }
  };
});
