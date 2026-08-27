'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlipCard } from '@cos-design/flip-card';
import { NineGrid } from '@cos-design/nine-grid';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function CampaignCheckin() {
  const confettiRef = useRef<ConfettiHandle>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | undefined>();
  const [status, setStatus] = useState('Flip the card to check in, then draw.');

  const onReveal = async () => {
    setCheckedIn(true);
    confettiRef.current?.burst();
    setStatus('Checked in — requesting server draw…');
    try {
      const res = await fetch('/api/draw?cells=9');
      const data = (await res.json()) as { targetIndex: number; prizeHint?: string };
      setTargetIndex(data.targetIndex % 9);
      setStatus(data.prizeHint ?? `targetIndex=${data.targetIndex % 9}`);
    } catch {
      setStatus('Draw request failed — you can still spin locally.');
    }
  };

  return (
    <section className="panel">
      <h2>Check-in → nine-grid draw</h2>
      <p>FlipCard reveal unlocks NineGrid. Optional server targetIndex from /api/draw.</p>
      <FlipCard
        frontTitle="Day 3"
        frontSubtitle="Tap to check in"
        backTitle="Checked in"
        backSubtitle="+20 pts · draw unlocked"
        onReveal={onReveal}
      />
      <p className="status">{status}</p>
      <NineGrid
        disabled={!checkedIn}
        targetIndex={targetIndex}
        buttonText={checkedIn ? 'Draw prize' : 'Check in first'}
        onDrawEnd={() => {
          confettiRef.current?.burst();
        }}
      />
      <div className="fireworksSlot">
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </section>
  );
}
