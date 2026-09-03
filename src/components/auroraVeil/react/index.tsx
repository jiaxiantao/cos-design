import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createAuroraVeil, type AuroraVeilController, type AuroraVeilOptions } from '../core';
import '../style/index.css';

export type { AuroraVeilOptions, AuroraVeilProps } from '../core/types';

const AuroraVeil = forwardRef<unknown, AuroraVeilOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AuroraVeilController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createAuroraVeil(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-auroraVeil-host" />;
});

AuroraVeil.displayName = 'AuroraVeil';

export default AuroraVeil;
