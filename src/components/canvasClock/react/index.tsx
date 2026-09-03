import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCanvasClock, type CanvasClockController, type CanvasClockOptions } from '../core';
import '../style/index.css';

export type { CanvasClockOptions, CanvasClockProps } from '../core/types';

const CanvasClock = forwardRef<unknown, CanvasClockOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CanvasClockController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCanvasClock(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-canvasClock-host" />;
});

CanvasClock.displayName = 'CanvasClock';

export default CanvasClock;
