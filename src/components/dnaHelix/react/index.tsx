import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createDnaHelix, type DnaHelixController, type DnaHelixOptions } from '../core';
import '../style/index.css';

export type { DnaHelixOptions, DnaHelixProps } from '../core/types';

const DnaHelix = forwardRef<unknown, DnaHelixOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<DnaHelixController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createDnaHelix(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-dnaHelix-host" />;
});

DnaHelix.displayName = 'DnaHelix';

export default DnaHelix;
