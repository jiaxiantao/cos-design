import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createRippleWater, type RippleWaterController, type RippleWaterOptions } from '../core';
import '../style/index.css';

export type { RippleWaterOptions, RippleWaterProps } from '../core/types';

const RippleWater = forwardRef<unknown, RippleWaterOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RippleWaterController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createRippleWater(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-rippleWater-host" />;
});

RippleWater.displayName = 'RippleWater';

export default RippleWater;
