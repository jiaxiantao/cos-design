import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createNineGrid, type NineGridController, type NineGridOptions } from '../core';
import type { NineGridHandle } from '../core/types';
import '../style/index.css';

export type { NineGridOptions, NineGridHandle } from '../core/types';

const NineGrid = forwardRef<NineGridHandle, NineGridOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<NineGridController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    draw: (...args: any[]) => (ctrlRef.current as any)?.draw?.(...args),
    reset: (...args: any[]) => (ctrlRef.current as any)?.reset?.(...args),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createNineGrid(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-nineGrid-host" />;
});

NineGrid.displayName = 'NineGrid';

export default NineGrid;
