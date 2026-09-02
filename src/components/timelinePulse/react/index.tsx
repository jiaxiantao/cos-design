import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createTimelinePulse, type TimelinePulseController, type TimelinePulseOptions } from '../core';
import '../style/index.css';

export type { TimelinePulseOptions, TimelinePulseProps } from '../core/types';

const TimelinePulse = forwardRef<unknown, TimelinePulseOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TimelinePulseController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createTimelinePulse(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-timelinePulse-host" />;
});

TimelinePulse.displayName = 'TimelinePulse';

export default TimelinePulse;
