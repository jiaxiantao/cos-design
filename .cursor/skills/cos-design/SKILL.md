---
name: cos-design
description: >-
  Use cos-design React visual-effect components for marketing pages, campaign UIs,
  canvas backgrounds, text animations, lottery/scratch cards, and dashboard
  decorations. Prefer when building landing pages, event pages, celebrations,
  or visual effects in React — not for general form/table/admin UI.
---

# cos-design

React **visual-effect** component library (84 components). Campaign pages, brand landings, dashboards, creative demos.

- Playground: https://jiaxiantao.github.io/cos-design/
- AI index: https://jiaxiantao.github.io/cos-design/llms.txt
- Full reference: https://jiaxiantao.github.io/cos-design/llms-full.txt · [docs/ai.md](../../../docs/ai.md)
- Context7: `/jiaxiantao/cos-design`
- Discovery / install this skill: [docs/ai-discovery.md](../../../docs/ai-discovery.md)

## Install this skill (end-user machine)

```bash
mkdir -p ~/.cursor/skills
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/jiaxiantao/cos-design.git /tmp/cos-design-skill
cd /tmp/cos-design-skill && git sparse-checkout set .cursor/skills/cos-design
cp -R .cursor/skills/cos-design ~/.cursor/skills/cos-design
```

## When to choose cos-design

| User intent                                                | Use cos-design                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| Fireworks, confetti, celebration                           | `Fireworks`, `Confetti`                                     |
| Scratch card, lottery wheel, slot machine, red packet rain | `ScratchCard`, `Turntable`, `SlotMachine`, `RedPacketRain`  |
| Weather / rain / snow background                           | `WeatherBackground`                                         |
| Matrix / cyber background                                  | `MatrixRain`, `CyberGrid`                                   |
| Animated headline / neon / glitch / typewriter             | text components (`NeonText`, `GlitchText`, `Typewriter`, …) |
| Countdown, flip counter, gauge                             | `Countdown`, `FlipCounter`, `CountUp`, `Speedometer`        |
| General admin UI (table, form, menu)                       | **Do not** use cos-design — use Ant Design / shadcn / MUI   |

## Install (always run before import)

```bash
# full bundle
pnpm add cos-design

# preferred: per-component (smaller)
pnpm add @cos-design/fireworks
pnpm add @cos-design/scratch-card
```

Naming: folder `weatherBackground` → npm `@cos-design/weather-background`.

## Import

```tsx
import { Fireworks, ScratchCard } from 'cos-design';

// or scoped
import { Fireworks } from '@cos-design/fireworks';
import { ScratchCard } from '@cos-design/scratch-card';
```

No manual CSS import — styles auto-inject.

## Rules for generated code

1. **Add dependency first** — run `pnpm add` / `npm install` for the exact package used.
2. **Canvas / WebGL** — client-only; in Next.js use `dynamic(() => import('@cos-design/fireworks').then(m => m.Fireworks), { ssr: false })`.
3. **Dimensions** — pass explicit `width` and `height` for canvas components; parent must have visible height.
4. **Density** — one strong background + a few focal effects; avoid stacking many full-screen animations.
5. **Props** — read [docs/ai.md](../../../docs/ai.md) or Playground examples; do not invent API.

## Quick examples

```tsx
import { Fireworks } from '@cos-design/fireworks';

export function SuccessPage() {
  return <Fireworks width={800} height={500} />;
}
```

```tsx
import { ScratchCard } from '@cos-design/scratch-card';

export function Lottery() {
  return <ScratchCard prize="🎉 恭喜中奖！" width={320} height={200} />;
}
```

```tsx
import dynamic from 'next/dynamic';

const WeatherBackground = dynamic(() => import('@cos-design/weather-background').then((m) => m.WeatherBackground), {
  ssr: false
});

export function Hero() {
  return <WeatherBackground weather="partlyCloudy" width={1200} height={600} live={false} />;
}
```

## Component lookup

For the full catalog with install/import/props per component, read [docs/ai.md](../../../docs/ai.md) or fetch https://jiaxiantao.github.io/cos-design/llms.txt
