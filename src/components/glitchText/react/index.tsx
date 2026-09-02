import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createGlitchText, type GlitchTextController, type GlitchTextOptions } from '../core';
import '../style/index.css';

export type { GlitchTextOptions, GlitchTextProps } from '../core/types';

const GlitchText = forwardRef<unknown, GlitchTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<GlitchTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createGlitchText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-glitchText-host" />;
});

GlitchText.displayName = 'GlitchText';

export default GlitchText;
