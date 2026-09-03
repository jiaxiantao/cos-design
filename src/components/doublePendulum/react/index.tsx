import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createDoublePendulum,
  type DoublePendulumController,
  type DoublePendulumOptions,
} from '../core';
import '../style/index.css';

export type { DoublePendulumOptions, DoublePendulumProps } from '../core/types';

const DoublePendulum = forwardRef<unknown, DoublePendulumOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<DoublePendulumController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-doublePendulum-host" />;
});

DoublePendulum.displayName = 'DoublePendulum';

export default DoublePendulum;
