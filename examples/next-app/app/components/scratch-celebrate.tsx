'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { ScratchCard } from '@cos-design/scratch-card';
import type { FireworksHandle } from '@cos-design/fireworks';

const Fireworks = dynamic(() => import('@cos-design/fireworks').then((m) => m.Fireworks), {
  ssr: false,
});

export function ScratchCelebrate() {
  const ref = useRef<FireworksHandle>(null);

  return (
    <section className="panel">
      <h2>Scratch → fireworks</h2>
      <p>Reveal the prize to launch celebrations. Fireworks uses fill inside a sized slot.</p>
      <ScratchCard
        width={320}
        height={180}
        prize="50% OFF"
        coverText="Scratch me"
        onReveal={() => {
          ref.current?.launch(120);
          ref.current?.launch(240);
        }}
      />
      <div className="fireworksSlot">
        <Fireworks ref={ref} fill auto={false} />
      </div>
    </section>
  );
}
