import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSnowfall, type SnowfallController, type SnowfallOptions } from '../core';
import '../style/index.css';

export type { SnowfallOptions, SnowfallProps } from '../core/types';

const Snowfall = forwardRef<unknown, SnowfallOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SnowfallController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSnowfall(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-snowfall-host" />;
});

Snowfall.displayName = 'Snowfall';

export default Snowfall;
