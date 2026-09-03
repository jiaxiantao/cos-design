import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSolarSystem, type SolarSystemController, type SolarSystemOptions } from '../core';
import '../style/index.css';

export type { SolarSystemOptions, SolarSystemProps } from '../core/types';

const SolarSystem = forwardRef<unknown, SolarSystemOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SolarSystemController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSolarSystem(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-solarSystem-host" />;
});

SolarSystem.displayName = 'SolarSystem';

export default SolarSystem;
