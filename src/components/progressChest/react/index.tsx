import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createProgressChest,
  type ProgressChestController,
  type ProgressChestOptions,
} from '../core';
import '../style/index.css';

export type { ProgressChestOptions, ProgressChestProps } from '../core/types';

const ProgressChest = forwardRef<unknown, ProgressChestOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ProgressChestController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createProgressChest(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-progressChest-host" />;
});

ProgressChest.displayName = 'ProgressChest';

export default ProgressChest;
