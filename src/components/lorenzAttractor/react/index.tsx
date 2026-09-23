import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createLorenzAttractor,
  type LorenzAttractorController,
  type LorenzAttractorOptions,
} from '../core';
import '../style/index.css';

export type { LorenzAttractorOptions } from '../core/types';

const LorenzAttractor = forwardRef<unknown, LorenzAttractorOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<LorenzAttractorController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-lorenzAttractor-host" />;
});

LorenzAttractor.displayName = 'LorenzAttractor';

export default LorenzAttractor;
