# Build a campaign page in 10 minutes — cos-design

A minimal React / Next.js path from empty app to **fill hero → check-in → lottery → celebrate**.

## 1. Install

```bash
pnpm add @cos-design/weather-background @cos-design/neon-text \
  @cos-design/flip-card @cos-design/nine-grid @cos-design/confetti
```

Or the umbrella: `pnpm add cos-design`.

## 2. Full-viewport hero (`fill`)

Parent needs an explicit height. Canvas components must be client-only in the App Router.

```tsx
'use client';
import dynamic from 'next/dynamic';
import { NeonText } from '@cos-design/neon-text';

const WeatherBackground = dynamic(() => import('@cos-design/weather-background').then((m) => m.WeatherBackground), {
  ssr: false
});

export function Hero() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <WeatherBackground fill weather="partlyCloudy" live={false} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <NeonText text="GRAND OPENING" />
      </div>
    </section>
  );
}
```

## 3. Check-in → draw → confetti

```tsx
'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlipCard } from '@cos-design/flip-card';
import { NineGrid } from '@cos-design/nine-grid';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function Campaign() {
  const confettiRef = useRef<ConfettiHandle>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <>
      <FlipCard
        frontTitle="Day 3"
        backTitle="Checked in"
        onReveal={() => {
          setCheckedIn(true);
          confettiRef.current?.burst();
        }}
      />
      <NineGrid disabled={!checkedIn} onDrawEnd={() => confettiRef.current?.burst()} />
      <div style={{ width: '100%', height: 280 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}
```

Buttons already disable themselves while drawing (`aria-busy`). For a second chance, call `reset()` on the component ref after your business rules allow it.

## 4. Optional server lottery

```ts
// app/api/draw/route.ts
export async function GET(request: Request) {
  const cells = Number(new URL(request.url).searchParams.get('cells') ?? 9);
  return Response.json({ targetIndex: Math.floor(Math.random() * cells) });
}
```

Fetch before or as props: `<NineGrid targetIndex={targetIndex} />`.

## 5. When **not** to use cos-design

Skip this library for admin tables, forms, date pickers, and navigation shells — use Ant Design, shadcn/ui, or MUI. cos-design is for **marketing / campaign visuals**, not CRUD UI.

## Next steps

| Resource                  | Link                                             |
| ------------------------- | ------------------------------------------------ |
| Runnable sample           | [examples/next-app](../examples/next-app)        |
| Busy / retry / visibility | [campaign-patterns.md](./campaign-patterns.md)   |
| AI index                  | https://jiaxiantao.github.io/cos-design/llms.txt |
| Context7                  | `/jiaxiantao/cos-design`                         |
| Playground                | https://jiaxiantao.github.io/cos-design/         |
