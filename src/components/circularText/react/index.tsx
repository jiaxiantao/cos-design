import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCircularText, type CircularTextController, type CircularTextOptions } from '../core';
import '../style/index.css';

export type { CircularTextOptions, CircularTextProps } from '../core/types';

const CircularText = forwardRef<unknown, CircularTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CircularTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCircularText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-circularText-host" />;
});

CircularText.displayName = 'CircularText';

export default CircularText;
