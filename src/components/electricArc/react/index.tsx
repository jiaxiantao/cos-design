import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createElectricArc, type ElectricArcController, type ElectricArcOptions } from '../core';
import '../style/index.css';

export type { ElectricArcOptions, ElectricArcProps } from '../core/types';

const ElectricArc = forwardRef<unknown, ElectricArcOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ElectricArcController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createElectricArc(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-electricArc-host" />;
});

ElectricArc.displayName = 'ElectricArc';

export default ElectricArc;
