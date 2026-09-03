import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createConfetti, type ConfettiController, type ConfettiHandle, type ConfettiOptions } from '../core';
import '../style/index.css';

export type { ConfettiHandle, ConfettiOptions, ConfettiProps } from '../core/types';

const Confetti = forwardRef<ConfettiHandle, ConfettiOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ConfettiController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    burst: () => ctrlRef.current?.burst()
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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-confetti-host" />;
});

Confetti.displayName = 'Confetti';

export default Confetti;
