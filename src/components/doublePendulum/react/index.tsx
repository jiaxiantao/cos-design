import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createDoublePendulum,
  type DoublePendulumController,
  type DoublePendulumOptions,
} from '../core';
import '../style/index.css';

export type { DoublePendulumOptions } from '../core/types';

const DoublePendulum = forwardRef<unknown, DoublePendulumOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<DoublePendulumController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createDoublePendulum(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-doublePendulum-host" />;
});

DoublePendulum.displayName = 'DoublePendulum';

export default DoublePendulum;
