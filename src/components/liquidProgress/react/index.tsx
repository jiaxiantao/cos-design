import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createLiquidProgress,
  type LiquidProgressController,
  type LiquidProgressOptions,
} from '../core';
import '../style/index.css';

export type { LiquidProgressOptions } from '../core/types';

const LiquidProgress = forwardRef<unknown, LiquidProgressOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<LiquidProgressController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createLiquidProgress(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-liquidProgress-host" />;
});

LiquidProgress.displayName = 'LiquidProgress';

export default LiquidProgress;
