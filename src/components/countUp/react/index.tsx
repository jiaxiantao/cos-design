import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCountUp, type CountUpController, type CountUpOptions } from '../core';
import '../style/index.css';

export type { CountUpOptions, CountUpProps } from '../core/types';

const CountUp = forwardRef<unknown, CountUpOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CountUpController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCountUp(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-countUp-host" />;
});

CountUp.displayName = 'CountUp';

export default CountUp;
