# Vue 3 — cos-design

Use the `/vue` subpath on the same package names as React.

## Install

```bash
pnpm add cos-design
# or per-component:
pnpm add @cos-design/weather-background @cos-design/fireworks
```

## Usage

```vue
<script setup lang="ts">
import { Fireworks } from '@cos-design/fireworks/vue';
import { ScratchCard } from '@cos-design/scratch-card/vue';
</script>

<template>
  <ScratchCard prize="50% OFF" :width="320" :height="200" />
  <Fireworks :width="800" :height="500" />
</template>
```

Umbrella import: `import { Fireworks } from 'cos-design/vue'`.

## Runnable example

See [examples/vue-app](../../examples/vue-app) — Vite + Vue 3 campaign page (check-in → NineGrid → Confetti).

## Related

- [migration-v4.md](../migration-v4.md)
- [vanilla / Web Components](./vanilla.md)
- [Next.js App Router](./next-app-router.md)
