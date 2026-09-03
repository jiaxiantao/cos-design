import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createStarfield, type StarfieldController, type StarfieldOptions } from '../core';
import '../style/index.css';

export type { StarfieldOptions, StarfieldProps } from '../core/types';

const Starfield = forwardRef<unknown, StarfieldOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<StarfieldController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createStarfield(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-starfield-host" />;
});

Starfield.displayName = 'Starfield';

export default Starfield;
