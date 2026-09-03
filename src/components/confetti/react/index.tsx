import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createConfetti, type ConfettiController, type ConfettiOptions } from '../core';
import type { ConfettiHandle } from '../core/types';
import '../style/index.css';

export type { ConfettiOptions, ConfettiHandle } from '../core/types';

const Confetti = forwardRef<ConfettiHandle, ConfettiOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ConfettiController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    burst: (...args: any[]) => (ctrlRef.current as any)?.burst?.(...args),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createConfetti(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-confetti-host" />;
});

Confetti.displayName = 'Confetti';

export default Confetti;
