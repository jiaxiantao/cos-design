import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createInkBloom, type InkBloomController, type InkBloomOptions } from '../core';
import '../style/index.css';

export type { InkBloomOptions, InkBloomProps } from '../core/types';

const InkBloom = forwardRef<unknown, InkBloomOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<InkBloomController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createInkBloom(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-inkBloom-host" />;
});

InkBloom.displayName = 'InkBloom';

export default InkBloom;
