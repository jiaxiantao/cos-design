import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createBarcodeScan, type BarcodeScanController, type BarcodeScanOptions } from '../core';
import '../style/index.css';

export type { BarcodeScanOptions, BarcodeScanProps } from '../core/types';

type SlotProps = BarcodeScanOptions & { children?: React.ReactNode };

const BarcodeScan = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<BarcodeScanController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    const slot = slotRef.current;
    if (!host || !slot) return;
    const ctrl = createBarcodeScan(host, { ...propsRef.current, slotElement: slot });
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    ctrlRef.current?.update({ ...props, slotElement: slot });
  }, [props]);

  return (
    <div ref={hostRef} className="cos-barcodeScan-host">
      <div ref={slotRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
});

BarcodeScan.displayName = 'BarcodeScan';

export default BarcodeScan;
