import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSandFall, type SandFallController, type SandFallOptions } from '../core';
import '../style/index.css';

export type { SandFallOptions, SandFallProps } from '../core/types';

const SandFall = forwardRef<unknown, SandFallOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SandFallController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSandFall(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-sandFall-host" />;
});

SandFall.displayName = 'SandFall';

export default SandFall;
