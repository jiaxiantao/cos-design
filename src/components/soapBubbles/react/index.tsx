import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSoapBubbles, type SoapBubblesController, type SoapBubblesOptions } from '../core';
import '../style/index.css';

export type { SoapBubblesOptions, SoapBubblesProps } from '../core/types';

const SoapBubbles = forwardRef<unknown, SoapBubblesOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SoapBubblesController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSoapBubbles(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-soapBubbles-host" />;
});

SoapBubbles.displayName = 'SoapBubbles';

export default SoapBubbles;
