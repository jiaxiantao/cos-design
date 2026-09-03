import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCyberGrid, type CyberGridController, type CyberGridOptions } from '../core';
import '../style/index.css';

export type { CyberGridOptions, CyberGridProps } from '../core/types';

const CyberGrid = forwardRef<unknown, CyberGridOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<CyberGridController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createCyberGrid(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-cyberGrid-host" />;
});

CyberGrid.displayName = 'CyberGrid';

export default CyberGrid;
