import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCursorTrail, type CursorTrailController, type CursorTrailOptions } from '../core';
import '../style/index.css';

export type { CursorTrailOptions, CursorTrailProps } from '../core/types';

const CursorTrail = forwardRef<unknown, CursorTrailOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CursorTrailController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCursorTrail(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-cursorTrail-host" />;
});

CursorTrail.displayName = 'CursorTrail';

export default CursorTrail;
