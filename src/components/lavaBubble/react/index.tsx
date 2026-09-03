import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createLavaBubble, type LavaBubbleController, type LavaBubbleOptions } from '../core';
import '../style/index.css';

export type { LavaBubbleOptions, LavaBubbleProps } from '../core/types';

const LavaBubble = forwardRef<unknown, LavaBubbleOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<LavaBubbleController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createLavaBubble(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-lavaBubble-host" />;
});

LavaBubble.displayName = 'LavaBubble';

export default LavaBubble;
