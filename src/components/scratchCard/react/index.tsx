import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createScratchCard, type ScratchCardController, type ScratchCardOptions } from '../core';
import type { ScratchCardHandle } from '../core/types';
import '../style/index.css';

export type { ScratchCardOptions, ScratchCardHandle } from '../core/types';

const ScratchCard = forwardRef<ScratchCardHandle, ScratchCardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ScratchCardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    reset: (...args: any[]) => (ctrlRef.current as any)?.reset?.(...args),
    reveal: (...args: any[]) => (ctrlRef.current as any)?.reveal?.(...args),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createScratchCard(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-scratchCard-host" />;
});

ScratchCard.displayName = 'ScratchCard';

export default ScratchCard;
