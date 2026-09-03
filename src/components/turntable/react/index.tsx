import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createTurntable, type TurntableController, type TurntableOptions } from '../core';
import type { TurntableHandle } from '../core/types';
import '../style/index.css';

export type { TurntableOptions, TurntableHandle } from '../core/types';

const Turntable = forwardRef<TurntableHandle, TurntableOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TurntableController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    spin: (...args: any[]) => (ctrlRef.current as any)?.spin?.(...args),
    reset: (...args: any[]) => (ctrlRef.current as any)?.reset?.(...args),
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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-turntable-host" />;
});

Turntable.displayName = 'Turntable';

export default Turntable;
