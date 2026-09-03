import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createNineGrid,
  type NineGridController,
  type NineGridHandle,
  type NineGridOptions,
} from '../core';
import '../style/index.css';

export type { NineGridHandle, NineGridOptions, NineGridProps } from '../core/types';

const NineGrid = forwardRef<NineGridHandle, NineGridOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<NineGridController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    draw: (targetIndex?: number) => ctrlRef.current?.draw(targetIndex),
    reset: () => ctrlRef.current?.reset(),
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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-nineGrid-host" />;
});

NineGrid.displayName = 'NineGrid';

export default NineGrid;
