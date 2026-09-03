import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createTurntable,
  type TurntableController,
  type TurntableHandle,
  type TurntableOptions,
} from '../core';
import '../style/index.css';

export type { TurntableHandle, TurntableOptions, TurntableProps } from '../core/types';

const Turntable = forwardRef<TurntableHandle, TurntableOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TurntableController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    spin: (targetIndex?: number) => ctrlRef.current?.spin(targetIndex),
    reset: () => ctrlRef.current?.reset(),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createTurntable(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-turntable-host" />;
});

Turntable.displayName = 'Turntable';

export default Turntable;
