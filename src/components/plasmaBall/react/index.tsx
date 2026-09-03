import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPlasmaBall, type PlasmaBallController, type PlasmaBallOptions } from '../core';
import '../style/index.css';

export type { PlasmaBallOptions, PlasmaBallProps } from '../core/types';

const PlasmaBall = forwardRef<unknown, PlasmaBallOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PlasmaBallController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPlasmaBall(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-plasmaBall-host" />;
});

PlasmaBall.displayName = 'PlasmaBall';

export default PlasmaBall;
