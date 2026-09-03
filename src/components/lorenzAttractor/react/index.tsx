import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createLorenzAttractor,
  type LorenzAttractorController,
  type LorenzAttractorOptions,
} from '../core';
import '../style/index.css';

export type { LorenzAttractorOptions, LorenzAttractorProps } from '../core/types';

const LorenzAttractor = forwardRef<unknown, LorenzAttractorOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<LorenzAttractorController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createLorenzAttractor(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-lorenzAttractor-host" />;
});

LorenzAttractor.displayName = 'LorenzAttractor';

export default LorenzAttractor;
