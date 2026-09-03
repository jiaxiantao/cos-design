import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createFireworks, type FireworksController, type FireworksOptions } from '../core';
import type { FireworksHandle } from '../core/types';
import '../style/index.css';

export type { FireworksHandle, FireworksOptions, FireworksProps } from '../core/types';

const Fireworks = forwardRef<FireworksHandle, FireworksOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<FireworksController | null>(null);
  const propsRef = useRef(props);

  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    launch: (x) => ctrlRef.current?.launch(x),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createFireworks(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-fireworks-host" />;
});

Fireworks.displayName = 'Fireworks';

export default Fireworks;
