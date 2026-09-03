import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createAurora, type AuroraController, type AuroraOptions } from '../core';
import '../style/index.css';

export type { AuroraOptions, AuroraProps } from '../core/types';

const Aurora = forwardRef<unknown, AuroraOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AuroraController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createAurora(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-aurora-host" />;
});

Aurora.displayName = 'Aurora';

export default Aurora;
