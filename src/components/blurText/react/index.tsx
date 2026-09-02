import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createBlurText, type BlurTextController, type BlurTextOptions } from '../core';
import '../style/index.css';

export type { BlurTextOptions, BlurTextProps } from '../core/types';

const BlurText = forwardRef<unknown, BlurTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<BlurTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createBlurText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-blurText-host" />;
});

BlurText.displayName = 'BlurText';

export default BlurText;
