import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createLiquidProgress,
  type LiquidProgressController,
  type LiquidProgressOptions,
} from '../core';
import '../style/index.css';

export type { LiquidProgressOptions, LiquidProgressProps } from '../core/types';

const LiquidProgress = forwardRef<unknown, LiquidProgressOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<LiquidProgressController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-liquidProgress-host" />;
});

LiquidProgress.displayName = 'LiquidProgress';

export default LiquidProgress;
