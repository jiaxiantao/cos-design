import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createFlipCard, type FlipCardController, type FlipCardOptions } from '../core';
import type { FlipCardHandle } from '../core/types';
import '../style/index.css';

export type { FlipCardOptions, FlipCardHandle } from '../core/types';

const FlipCard = forwardRef<FlipCardHandle, FlipCardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<FlipCardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    flip: (...args: any[]) => (ctrlRef.current as any)?.flip?.(...args),
    reset: (...args: any[]) => (ctrlRef.current as any)?.reset?.(...args),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createFlipCard(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-flipCard-host" />;
});

FlipCard.displayName = 'FlipCard';

export default FlipCard;
