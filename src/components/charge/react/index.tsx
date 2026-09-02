import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCharge, type ChargeController, type ChargeOptions } from '../core';
import '../style/index.css';

export type { ChargeOptions, ChargeProps } from '../core/types';

const Charge = forwardRef<unknown, ChargeOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ChargeController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCharge(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-charge-host" />;
});

Charge.displayName = 'Charge';

export default Charge;
