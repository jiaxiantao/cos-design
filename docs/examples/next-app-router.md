# Next.js App Router — cos-design

Minimal pattern for campaign / landing pages using cos-design with SSR-safe canvas components and `fill` sizing.

## Install

```bash
pnpm add cos-design
# or per-component:
pnpm add @cos-design/weather-background @cos-design/neon-text @cos-design/fireworks
```

## Client-only import

Canvas / WebGL components must not run on the server:

```tsx
// app/campaign/hero.tsx
'use client';

import dynamic from 'next/dynamic';
import { NeonText } from '@cos-design/neon-text';

const WeatherBackground = dynamic(() => import('@cos-design/weather-background').then((m) => m.WeatherBackground), {
  ssr: false
});

export function CampaignHero() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <WeatherBackground fill weather="partlyCloudy" live={false} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <NeonText text="GRAND OPENING" />
      </div>
    </section>
  );
}
```

## Celebration after interaction

```tsx
'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { ScratchCard } from '@cos-design/scratch-card';
import type { FireworksHandle } from '@cos-design/fireworks';

const Fireworks = dynamic(() => import('@cos-design/fireworks').then((m) => m.Fireworks), { ssr: false });

export function ScratchCelebrate() {
  const ref = useRef<FireworksHandle>(null);

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <ScratchCard
        width={320}
        height={180}
        prize="50% OFF"
        onReveal={() => {
          ref.current?.launch(120);
          ref.current?.launch(240);
        }}
      />
      <div style={{ width: 560, height: 320 }}>
        <Fireworks ref={ref} fill auto={false} />
      </div>
    </div>
  );
}
```

## Rules

| Topic     | Rule                                                                                 |
| --------- | ------------------------------------------------------------------------------------ |
| SSR       | `dynamic(..., { ssr: false })` or `'use client'` + dynamic for canvas                |
| Size      | Prefer `fill` inside a parent with explicit height (`100vh` / `500px`)               |
| Density   | One strong background + a few focal effects                                          |
| AI lookup | https://jiaxiantao.github.io/cos-design/llms.txt · Context7 `/jiaxiantao/cos-design` |

## Runnable sample

A full App Router project lives in the repo:

```bash
cd examples/next-app
pnpm install
pnpm dev
```

See [examples/next-app/README.md](../../examples/next-app/README.md). Primary fork path:

1. fill hero
2. FlipCard check-in → NineGrid (`/api/draw?cells=9`) → Confetti
3. optional Scratch / Turntable modules below

Guides: [campaign-10-minutes.md](../campaign-10-minutes.md) · [campaign-patterns.md](../campaign-patterns.md)

## Live demos

- Playground: https://jiaxiantao.github.io/cos-design/
