import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createLiquidGlass, type LiquidGlassController, type LiquidGlassOptions } from '../core';
import '../style/index.css';

export type { LiquidGlassOptions, LiquidGlassProps } from '../core/types';

type SlotProps = LiquidGlassOptions & { children?: React.ReactNode };

const LiquidGlass = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<LiquidGlassController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    const slot = slotRef.current;
    if (!host || !slot) return;
    const ctrl = createLiquidGlass(host, { ...propsRef.current, slotElement: slot });
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
    <div ref={hostRef} className="cos-liquidGlass-host">
      <div ref={slotRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
});

LiquidGlass.displayName = 'LiquidGlass';

export default LiquidGlass;
