'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ConfettiHandle } from '@cos-design/confetti';
import type { TurntableHandle } from '@cos-design/turntable';

const Turntable = dynamic(() => import('@cos-design/turntable').then((m) => m.Turntable), { ssr: false });
const Confetti = dynamic(() => import('@cos-design/confetti').then((m) => m.Confetti), { ssr: false });

export function ServerTurntable() {
  const turntableRef = useRef<TurntableHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  const [status, setStatus] = useState('Fetch a server draw, then spin.');
  const [pending, setPending] = useState(false);

  const drawAndSpin = async () => {
    if (pending) return;
    setPending(true);
    setStatus('Requesting /api/draw …');
    try {
      const res = await fetch('/api/draw');
      const data = (await res.json()) as { targetIndex: number; prizeHint?: string };
      setStatus(data.prizeHint ?? `targetIndex=${data.targetIndex}`);
      turntableRef.current?.spin(data.targetIndex);
    } catch {
      setStatus('Draw failed — try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="panel">
      <h2>Server lottery (targetIndex)</h2>
      <p>API route returns a winning index; Turntable.spin(index) lands on it.</p>
      <button type="button" className="drawBtn" onClick={drawAndSpin} disabled={pending}>
        {pending ? 'Drawing…' : 'Server draw → spin'}
      </button>
      <p className="status">{status}</p>
      <Turntable
        ref={turntableRef}
        size={280}
        buttonText="Manual spin"
        onSpinEnd={() => {
          confettiRef.current?.burst();
        }}
      />
      <div className="fireworksSlot">
        <Confetti ref={confettiRef} fill auto={false} />
      </div>
    </section>
  );
}
