/** Copy-paste TSX snippets for Playground recipes (English, agent-friendly). */
export const recipeSnippets: Record<string, string> = {
  'scratch-celebrate': `'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { ScratchCard } from '@cos-design/scratch-card';
import type { FireworksHandle } from '@cos-design/fireworks';

const Fireworks = dynamic(() => import('@cos-design/fireworks').then((m) => m.Fireworks), { ssr: false });

export function ScratchCelebrate() {
  const ref = useRef<FireworksHandle>(null);
  return (
    <>
      <ScratchCard width={320} height={180} prize="50% OFF" onReveal={() => ref.current?.launch(160)} />
      <div style={{ width: 560, height: 320 }}>
        <Fireworks ref={ref} fill auto={false} />
      </div>
    </>
  );
}`,

  'countdown-rain': `'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Countdown } from '@cos-design/countdown';
import type { RedPacketRainHandle } from '@cos-design/red-packet-rain';

const RedPacketRain = dynamic(() => import('@cos-design/red-packet-rain').then((m) => m.RedPacketRain), {
  ssr: false
});

export function CountdownRain() {
  const rainRef = useRef<RedPacketRainHandle>(null);
  const [ended, setEnded] = useState(false);
  return (
    <>
      <Countdown seconds={5} onEnd={() => { setEnded(true); rainRef.current?.start(); }} />
      <div style={{ width: 480, height: 320 }}>
        <RedPacketRain ref={rainRef} fill auto={false} />
      </div>
      <p>{ended ? 'Rain started' : 'Waiting…'}</p>
    </>
  );
}`,

  'turntable-confetti': `'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Turntable } from '@cos-design/turntable';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function TurntableConfetti() {
  const confettiRef = useRef<ConfettiHandle>(null);
  return (
    <>
      <Turntable onSpinEnd={() => confettiRef.current?.burst()} />
      <div style={{ width: 420, height: 260 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}`,

  'chest-open': `'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Charge } from '@cos-design/charge';
import { ProgressChest } from '@cos-design/progress-chest';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function ChestOpen() {
  const confettiRef = useRef<ConfettiHandle>(null);
  const [progress, setProgress] = useState(0);
  return (
    <>
      <Charge onChange={setProgress} onComplete={() => confettiRef.current?.burst()} />
      <ProgressChest progress={progress} onOpen={() => confettiRef.current?.burst()} />
      <div style={{ width: 420, height: 260 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}`,

  'slot-jackpot': `'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { SlotMachine } from '@cos-design/slot-machine';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function SlotJackpot() {
  const confettiRef = useRef<ConfettiHandle>(null);
  return (
    <>
      <SlotMachine
        onSpinEnd={(results) => {
          if (results[0] === results[1] && results[1] === results[2]) confettiRef.current?.burst();
        }}
      />
      <div style={{ width: 420, height: 260 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}`,

  'fill-hero': `'use client';
import dynamic from 'next/dynamic';
import { NeonText } from '@cos-design/neon-text';

const WeatherBackground = dynamic(
  () => import('@cos-design/weather-background').then((m) => m.WeatherBackground),
  { ssr: false }
);

export function FillHero() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <WeatherBackground fill weather="partlyCloudy" live={false} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        <NeonText text="GRAND OPENING" />
      </div>
    </section>
  );
}`,

  'nine-grid-draw': `'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { NineGrid } from '@cos-design/nine-grid';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function NineGridDraw() {
  const confettiRef = useRef<ConfettiHandle>(null);
  return (
    <>
      <NineGrid onDrawEnd={() => confettiRef.current?.burst()} />
      <div style={{ width: 480, height: 280 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}`,

  'flip-checkin': `'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { FlipCard } from '@cos-design/flip-card';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function FlipCheckin() {
  const confettiRef = useRef<ConfettiHandle>(null);
  return (
    <>
      <FlipCard frontTitle="Day 3" backTitle="Checked in" onReveal={() => confettiRef.current?.burst()} />
      <div style={{ width: 480, height: 280 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}`,

  'checkin-draw': `'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlipCard } from '@cos-design/flip-card';
import { NineGrid } from '@cos-design/nine-grid';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function CheckinDraw() {
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
      <NineGrid
        disabled={!checkedIn}
        buttonText={checkedIn ? 'Draw' : 'Check in first'}
        onDrawEnd={() => confettiRef.current?.burst()}
      />
      <div style={{ width: 480, height: 280 }}>
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </>
  );
}`
};
