import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createAuroraVeil, type AuroraVeilController, type AuroraVeilOptions } from '../core';
import '../style/index.css';

export type { AuroraVeilOptions } from '../core/types';

const AuroraVeil = forwardRef<unknown, AuroraVeilOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AuroraVeilController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-auroraVeil-host" />;
});

AuroraVeil.displayName = 'AuroraVeil';

export default AuroraVeil;
