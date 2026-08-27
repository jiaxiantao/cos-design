'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlipCard } from '@cos-design/flip-card';
import { NineGrid } from '@cos-design/nine-grid';
import type { ConfettiHandle } from '@cos-design/confetti';

const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

/**
 * Primary campaign chain for this example:
 * FlipCard check-in → unlock NineGrid → optional /api/draw?cells=9 → Confetti.
 * Busy/disabled states are built into FlipCard / NineGrid (no double-draw while spinning).
 */
export function CampaignFlow() {
  const confettiRef = useRef<ConfettiHandle>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | undefined>();
  const [status, setStatus] = useState('1) Flip to check in · 2) Draw once the grid unlocks');

  const onReveal = async () => {
    setCheckedIn(true);
    confettiRef.current?.burst();
    setStatus('Checked in — requesting server targetIndex…');
    try {
      const res = await fetch('/api/draw?cells=9');
      const data = (await res.json()) as { targetIndex: number; prizeHint?: string };
      setTargetIndex(data.targetIndex % 9);
      setStatus(data.prizeHint ?? `Server targetIndex=${data.targetIndex % 9}`);
    } catch {
      setStatus('Draw request failed — NineGrid will fall back to a local random result.');
    }
  };

  return (
    <section className="panel" id="campaign">
      <p className="eyebrow">Primary flow</p>
      <h2>Check-in → nine-grid draw</h2>
      <p>
        One forkable chain: FlipCard unlocks NineGrid. Button stays <code>aria-busy</code> while drawing — call{' '}
        <code>reset()</code> only when you intentionally allow another draw.
      </p>
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
        onDrawEnd={(_item, index) => {
          confettiRef.current?.burst();
          setStatus(`Won cell ${index}. Use NineGrid.reset() if the user may draw again.`);
        }}
      />
      <div className="fireworksSlot">
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </section>
  );
}
