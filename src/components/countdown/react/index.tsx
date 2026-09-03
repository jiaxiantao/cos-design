import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCountdown, type CountdownController, type CountdownOptions } from '../core';
import '../style/index.css';

export type { CountdownOptions, CountdownProps } from '../core/types';

const Countdown = forwardRef<unknown, CountdownOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CountdownController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCountdown(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-countdown-host" />;
});

Countdown.displayName = 'Countdown';

export default Countdown;
