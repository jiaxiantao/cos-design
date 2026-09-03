import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createFlipCounter, type FlipCounterController, type FlipCounterOptions } from '../core';
import '../style/index.css';

export type { FlipCounterOptions, FlipCounterProps } from '../core/types';

const FlipCounter = forwardRef<unknown, FlipCounterOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<FlipCounterController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createFlipCounter(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-flipCounter-host" />;
});

FlipCounter.displayName = 'FlipCounter';

export default FlipCounter;
