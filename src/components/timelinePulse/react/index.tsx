import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createTimelinePulse,
  type TimelinePulseController,
  type TimelinePulseOptions,
} from '../core';
import '../style/index.css';

export type { TimelinePulseOptions } from '../core/types';

const TimelinePulse = forwardRef<unknown, TimelinePulseOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TimelinePulseController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-timelinePulse-host" />;
});

TimelinePulse.displayName = 'TimelinePulse';

export default TimelinePulse;
