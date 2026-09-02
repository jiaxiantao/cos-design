import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCurvedLoop, type CurvedLoopController, type CurvedLoopOptions } from '../core';
import '../style/index.css';

export type { CurvedLoopOptions, CurvedLoopProps } from '../core/types';

const CurvedLoop = forwardRef<unknown, CurvedLoopOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CurvedLoopController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCurvedLoop(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-curvedLoop-host" />;
});

CurvedLoop.displayName = 'CurvedLoop';

export default CurvedLoop;
