import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const root = resolve(__dirname, '../..');

const PKG: Record<string, string> = {
  confetti: 'confetti',
  fireworks: 'fireworks',
  'flip-card': 'flipCard',
  'neon-text': 'neonText',
  'nine-grid': 'nineGrid',
  'scratch-card': 'scratchCard',
  'weather-background': 'weatherBackground',
};

const aliases = [
  {
    find: '@cos-design/shared/react',
    replacement: resolve(root, 'packages/shared/src/react/index.ts'),
  },
  {
    find: '@cos-design/shared',
    replacement: resolve(root, 'packages/shared/src/index.ts'),
  },
  ...Object.entries(PKG).flatMap(([kebab, dir]) => [
    {
      find: `@cos-design/${kebab}/vue`,
      replacement: resolve(root, `packages/${dir}/src/vue.ts`),
    },
    {
      find: `@cos-design/${kebab}/core`,
      replacement: resolve(root, `packages/${dir}/src/core.ts`),
    },
    {
      find: `@cos-design/${kebab}/element`,
      replacement: resolve(root, `packages/${dir}/src/element.ts`),
    },
    {
      find: `@cos-design/${kebab}`,
      replacement: resolve(root, `packages/${dir}/src/react.ts`),
    },
  ]),
];

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: aliases },
  server: { port: 5174 },
});
