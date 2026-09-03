import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSpeedometer, type SpeedometerController, type SpeedometerOptions } from '../core';
import '../style/index.css';

export type { SpeedometerOptions, SpeedometerProps } from '../core/types';

const Speedometer = forwardRef<unknown, SpeedometerOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpeedometerController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSpeedometer(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-speedometer-host" />;
});

Speedometer.displayName = 'Speedometer';

export default Speedometer;
