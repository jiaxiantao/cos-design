# Campaign recipes for AI agents — cos-design

Copy-paste compositions for common marketing / event pages. Prefer these over inventing new component mashups.

Runnable reference: [examples/next-app](../examples/next-app) · patterns: [campaign-patterns.md](./campaign-patterns.md) · quickstart: [campaign-10-minutes.md](./campaign-10-minutes.md)

## Recipe A — Check-in → nine-grid lottery → confetti

**When:** daily check-in unlocks a draw; server returns `targetIndex`.

```bash
pnpm add @cos-design/weather-background @cos-design/neon-text \
  @cos-design/flip-card @cos-design/nine-grid @cos-design/confetti
```

```tsx
'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlipCard } from '@cos-design/flip-card';
import { NineGrid, type NineGridHandle } from '@cos-design/nine-grid';
import type { ConfettiHandle } from '@cos-design/confetti';

const WeatherBackground = dynamic(() => import('@cos-design/weather-background').then((m) => m.WeatherBackground), {
  ssr: false
});
const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function Campaign() {
  const gridRef = useRef<NineGridHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const draw = async () => {
    const res = await fetch('/api/draw?cells=9');
    const { targetIndex } = await res.json();
    gridRef.current?.draw(targetIndex);
  };

  return (
    <>
      <section style={{ position: 'relative', height: '100vh' }}>
        <WeatherBackground fill weather="partlyCloudy" live={false} />
      </section>
      <FlipCard onReveal={() => setCheckedIn(true)} />
      <NineGrid ref={gridRef} disabled={!checkedIn} onDrawEnd={() => confettiRef.current?.burst()} />
      <div style={{ height: 280 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
      <button type="button" onClick={draw} disabled={!checkedIn}>
        抽奖
      </button>
    </>
  );
}
```

**Rules:** fetch `targetIndex` before `draw()`; do not double-tap while `aria-busy`; `Confetti` with `auto={false}` does not block clicks.

---

## Recipe B — Scratch card → fireworks

**When:** scratch-to-reveal prize, then full-screen celebration.

```bash
pnpm add @cos-design/scratch-card @cos-design/fireworks
```

```tsx
'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { ScratchCard } from '@cos-design/scratch-card';
import type { FireworksHandle } from '@cos-design/fireworks';

const Fireworks = dynamic(() => import('@cos-design/fireworks').then((m) => m.Fireworks), { ssr: false });

export function ScratchCelebrate() {
  const fireworksRef = useRef<FireworksHandle>(null);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Fireworks ref={fireworksRef} fill auto={false} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <ScratchCard prize="🎉 50% OFF" width={320} height={200} onReveal={() => fireworksRef.current?.launch()} />
      </div>
    </div>
  );
}
```

---

## Recipe C — Turntable with server `targetIndex`

**When:** wheel lottery; backend picks the segment.

```bash
pnpm add @cos-design/turntable @cos-design/confetti
```

```tsx
'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Turntable, type TurntableHandle } from '@cos-design/turntable';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function WheelDraw() {
  const wheelRef = useRef<TurntableHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);

  const spin = async () => {
    const res = await fetch('/api/draw?cells=6');
    const { targetIndex } = await res.json();
    wheelRef.current?.spin(targetIndex);
  };

  return (
    <>
      <Turntable ref={wheelRef} onSpinEnd={() => confettiRef.current?.burst()} />
      <button type="button" onClick={spin}>
        开始抽奖
      </button>
      <div style={{ height: 240 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}
```

**Rules:** `Turntable` / `NineGrid` / `SlotMachine` expose `aria-busy` while animating; call `reset()` only for intentional retries.

---

## Recipe D — Hero background + countdown + flip counter

**When:** launch / sale landing with urgency, no lottery.

```bash
pnpm add @cos-design/aurora @cos-design/countdown @cos-design/flip-counter @cos-design/neon-text
```

```tsx
import { Aurora } from '@cos-design/aurora';
import { Countdown } from '@cos-design/countdown';
import { FlipCounter } from '@cos-design/flip-counter';
import { NeonText } from '@cos-design/neon-text';

export function LaunchHero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'grid', placeItems: 'center', gap: 24 }}>
      <Aurora fill />
      <NeonText text="GRAND OPENING" />
      <Countdown targetDate={new Date('2026-12-31T23:59:59')} />
      <FlipCounter value={12840} />
    </section>
  );
}
```

---

## Engineering checklist (agents)

| Topic   | Rule                                                                                         |
| ------- | -------------------------------------------------------------------------------------------- |
| SSR     | Canvas/WebGL: `dynamic(..., { ssr: false })` in Next.js App Router                           |
| Size    | `fill` requires parent with explicit height (`100vh` / fixed px)                             |
| Busy    | Never fire a second server draw while `aria-busy` is true                                    |
| Pointer | Celebration canvases: `auto={false}` so lottery buttons stay clickable                       |
| Motion  | `prefers-reduced-motion: reduce` skips spin animations on Turntable / SlotMachine / NineGrid |
| Density | One strong background + one interaction focal per viewport                                   |
