import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createRotatingText, type RotatingTextController, type RotatingTextOptions } from '../core';
import '../style/index.css';

export type { RotatingTextOptions, RotatingTextProps } from '../core/types';

const RotatingText = forwardRef<unknown, RotatingTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RotatingTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createRotatingText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-rotatingText-host" />;
});

RotatingText.displayName = 'RotatingText';

export default RotatingText;
