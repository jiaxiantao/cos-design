import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createMeteorRain, type MeteorRainController, type MeteorRainOptions } from '../core';
import '../style/index.css';

export type { MeteorRainOptions } from '../core/types';

const MeteorRain = forwardRef<unknown, MeteorRainOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<MeteorRainController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createMeteorRain(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-meteorRain-host" />;
});

MeteorRain.displayName = 'MeteorRain';

export default MeteorRain;
