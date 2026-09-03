import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createMetaballPool, type MetaballPoolController, type MetaballPoolOptions } from '../core';
import '../style/index.css';

export type { MetaballPoolOptions, MetaballPoolProps } from '../core/types';

const MetaballPool = forwardRef<unknown, MetaballPoolOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<MetaballPoolController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createMetaballPool(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-metaballPool-host" />;
});

MetaballPool.displayName = 'MetaballPool';

export default MetaballPool;
