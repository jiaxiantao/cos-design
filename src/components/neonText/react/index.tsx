import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createNeonText, type NeonTextController, type NeonTextOptions } from '../core';
import '../style/index.css';

export type { NeonTextOptions, NeonTextProps } from '../core/types';

const NeonText = forwardRef<unknown, NeonTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<NeonTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createNeonText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-neonText-host" />;
});

NeonText.displayName = 'NeonText';

export default NeonText;
