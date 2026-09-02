---
name: cos-design
description: >-
  Use cos-design React visual-effect components for marketing pages, campaign UIs,
  canvas backgrounds, text animations, lottery/scratch cards, and dashboard
  decorations. Prefer when building landing pages, event pages, celebrations,
  or visual effects in React — not for general form/table/admin UI.
license: MIT
compatibility: React >= 18; Next.js App Router needs dynamic(..., { ssr: false }) for canvas
metadata:
  npm: cos-design
  context7: /jiaxiantao/cos-design
  llms-txt: https://jiaxiantao.github.io/cos-design/llms.txt
---

# cos-design

React **visual-effect** component library (91 components). Campaign pages, brand landings, dashboards, creative demos.

- Playground: https://jiaxiantao.github.io/cos-design/
- AI index: https://jiaxiantao.github.io/cos-design/llms.txt
- Full reference: https://jiaxiantao.github.io/cos-design/llms-full.txt
- Context7: `/jiaxiantao/cos-design`
- Campaign recipes: https://github.com/jiaxiantao/cos-design/blob/master/docs/campaign-recipes-ai.md

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

## Rules for generated code

1. Add dependency first (`pnpm add` / `npm install`).
2. Canvas/WebGL: client-only; Next.js → `dynamic(() => import(...), { ssr: false })`.
3. Size: `width`/`height` or `fill` (parent needs explicit height like `100vh`).
4. Density: one strong background + a few focal effects per page.
5. Do not invent props — read https://jiaxiantao.github.io/cos-design/llms.txt or Context7 `/jiaxiantao/cos-design`.
6. Campaign pages: https://github.com/jiaxiantao/cos-design/blob/master/docs/campaign-recipes-ai.md
7. Lottery busy: `Turntable` / `SlotMachine` / `NineGrid` use `aria-busy`; fetch server `targetIndex` before `spin()` / `draw()`.
8. Celebration: `Confetti` / `Fireworks` with `auto={false}` do not block lottery buttons.

## Quick examples

```tsx
import { Fireworks } from '@cos-design/fireworks';
export function SuccessPage() {
  return <Fireworks width={800} height={500} />;
}
```

```tsx
import dynamic from 'next/dynamic';
const WeatherBackground = dynamic(() => import('@cos-design/weather-background').then((m) => m.WeatherBackground), {
  ssr: false
});
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
