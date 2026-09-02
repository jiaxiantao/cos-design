import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createTypewriter, type TypewriterController, type TypewriterOptions } from '../core';
import '../style/index.css';

export type { TypewriterOptions, TypewriterProps } from '../core/types';

const Typewriter = forwardRef<unknown, TypewriterOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TypewriterController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createTypewriter(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-typewriter-host" />;
});

Typewriter.displayName = 'Typewriter';

export default Typewriter;
