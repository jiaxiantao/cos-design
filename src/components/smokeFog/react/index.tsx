import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSmokeFog, type SmokeFogController, type SmokeFogOptions } from '../core';
import '../style/index.css';

export type { SmokeFogOptions, SmokeFogProps } from '../core/types';

const SmokeFog = forwardRef<unknown, SmokeFogOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SmokeFogController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSmokeFog(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-smokeFog-host" />;
});

SmokeFog.displayName = 'SmokeFog';

export default SmokeFog;
