import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createSpeedometer, type SpeedometerController, type SpeedometerOptions } from '../core';
import '../style/index.css';

export type { SpeedometerOptions } from '../core/types';

const Speedometer = forwardRef<unknown, SpeedometerOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpeedometerController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-speedometer-host" />;
});

Speedometer.displayName = 'Speedometer';

export default Speedometer;
