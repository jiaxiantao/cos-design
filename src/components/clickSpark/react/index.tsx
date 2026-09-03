import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createClickSpark, type ClickSparkController, type ClickSparkOptions } from '../core';
import '../style/index.css';

export type { ClickSparkOptions, ClickSparkProps } from '../core/types';

type SlotProps = ClickSparkOptions & { children?: React.ReactNode };

const ClickSpark = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ClickSparkController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    const slot = slotRef.current;
    if (!host || !slot) return;
    const ctrl = createClickSpark(host, { ...propsRef.current, slotElement: slot });
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
    <div ref={hostRef} className="cos-clickSpark-host">
      <div ref={slotRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
});

ClickSpark.displayName = 'ClickSpark';

export default ClickSpark;
