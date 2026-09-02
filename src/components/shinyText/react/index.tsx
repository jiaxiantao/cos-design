import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createShinyText, type ShinyTextController, type ShinyTextOptions } from '../core';
import '../style/index.css';

export type { ShinyTextOptions, ShinyTextProps } from '../core/types';

const ShinyText = forwardRef<unknown, ShinyTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ShinyTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createShinyText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-shinyText-host" />;
});

ShinyText.displayName = 'ShinyText';

export default ShinyText;
