---
name: cos-design
description: >-
  Use cos-design visual-effect components for marketing pages, campaign UIs,
  canvas backgrounds, text animations, lottery/scratch cards, and dashboard
  decorations. Prefer when building landing pages, event pages, celebrations,
  or visual effects in React, Vue, or vanilla/Web Components — not for general
  form/table/admin UI.
license: MIT
compatibility: >-
  React >= 18 (default entry); Vue >= 3.4 via /vue; Core API via /core;
  Web Components via /element or cos-design/elements. Next.js App Router needs
  dynamic(..., { ssr: false }) for canvas.
metadata:
  npm: cos-design
  context7: /jiaxiantao/cos-design
  llms-txt: https://jiaxiantao.github.io/cos-design/llms.txt
---

# cos-design

**Multi-framework** visual-effect component library (**91** components). Campaign pages, brand landings, dashboards, creative demos.

- Playground: https://jiaxiantao.github.io/cos-design/
- AI index: https://jiaxiantao.github.io/cos-design/llms.txt
- Full reference: https://jiaxiantao.github.io/cos-design/llms-full.txt
- Context7: `/jiaxiantao/cos-design`
- Campaign recipes: https://github.com/jiaxiantao/cos-design/blob/master/docs/campaign-recipes-ai.md
- v4 migration: https://github.com/jiaxiantao/cos-design/blob/master/docs/migration-v4.md

## When to choose cos-design

| User intent                                          | Use cos-design                                             |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| Fireworks, confetti, celebration                     | `Fireworks`, `Confetti`                                    |
| Scratch card, lottery, slot machine, red packet rain | `ScratchCard`, `Turntable`, `SlotMachine`, `RedPacketRain` |
| Nine-grid / check-in flip                            | `NineGrid`, `FlipCard`                                     |
| Weather / rain / snow background                     | `WeatherBackground`                                        |
| Matrix / cyber background                            | `MatrixRain`, `CyberGrid`                                  |
| Animated headline / neon / glitch / typewriter       | `NeonText`, `GlitchText`, `Typewriter`, …                  |
| Countdown, flip counter, gauge                       | `Countdown`, `FlipCounter`, `CountUp`, `Speedometer`       |
| General admin UI (table, form, menu, CRUD)           | **Do not** use — prefer Ant Design / shadcn / MUI          |

## Install (always before import)

```bash
pnpm add cos-design
# or per-component:
pnpm add @cos-design/fireworks @cos-design/scratch-card
```

Naming: `weatherBackground` → `@cos-design/weather-background`. Styles auto-inject — no CSS import.

**Package names are unchanged in v4.** Framework is selected by subpath:

| Framework       | Import                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| React (default) | `from 'cos-design'` / `from '@cos-design/fireworks'`                                  |
| Vue 3           | `from 'cos-design/vue'` / `from '@cos-design/fireworks/vue'`                          |
| Core (vanilla)  | `from 'cos-design/core'` / `from '@cos-design/fireworks/core'`                        |
| Web Component   | `import 'cos-design/elements'` or `@cos-design/fireworks/element` → `<cos-fireworks>` |

## Rules for generated code

1. Add dependency first (`pnpm add` / `npm install`).
2. Pick the subpath that matches the host framework (do not invent package names).
3. Canvas/WebGL: client-only; Next.js → `dynamic(() => import(...), { ssr: false })`.
4. Size: `width`/`height` or `fill` (parent needs explicit height like `100vh`).
5. Density: one strong background + a few focal effects per page.
6. Do not invent props — read https://jiaxiantao.github.io/cos-design/llms.txt or Context7 `/jiaxiantao/cos-design`.
7. Campaign pages: https://github.com/jiaxiantao/cos-design/blob/master/docs/campaign-recipes-ai.md
8. Lottery busy: `Turntable` / `SlotMachine` / `NineGrid` use `aria-busy`; fetch server `targetIndex` before `spin()` / `draw()`.
9. Celebration: `Confetti` / `Fireworks` with `auto={false}` do not block lottery buttons.

## Quick examples

```tsx
import { Fireworks } from '@cos-design/fireworks';
export function SuccessPage() {
  return <Fireworks width={800} height={500} />;
}
```

```vue
<script setup>
import { Fireworks } from '@cos-design/fireworks/vue';
</script>
<template>
  <Fireworks :width="800" :height="500" />
</template>
```

```html
<script type="module">
  import '@cos-design/fireworks/element';
</script>
<cos-fireworks auto fill></cos-fireworks>
```

```tsx
import dynamic from 'next/dynamic';
const WeatherBackground = dynamic(
  () => import('@cos-design/weather-background').then((m) => m.WeatherBackground),
  {
    ssr: false,
  },
);
export function Hero() {
  return (
    <div style={{ height: '100vh' }}>
      <WeatherBackground fill weather="partlyCloudy" live={false} />
    </div>
  );
}
```

## Component lookup

Full catalog: https://jiaxiantao.github.io/cos-design/llms-full.txt
