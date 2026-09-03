import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createBurnAway,
  type BurnAwayController,
  type BurnAwayHandle,
  type BurnAwayOptions,
} from '../core';
import '../style/index.css';

export type { BurnAwayHandle, BurnAwayOptions, BurnAwayProps } from '../core/types';

const BurnAway = forwardRef<BurnAwayHandle, BurnAwayOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<BurnAwayController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    ignite: () => ctrlRef.current?.ignite(),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createBurnAway(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-burnAway-host" />;
});

BurnAway.displayName = 'BurnAway';

export default BurnAway;
