import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

export type { SpotlightOptions, SpotlightProps } from '../core/types';

type SlotProps = SpotlightOptions & { children?: React.ReactNode };

const Spotlight = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpotlightController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    const slot = slotRef.current;
    if (!host || !slot) return;
    const ctrl = createSpotlight(host, { ...propsRef.current, slotElement: slot });
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
    <div ref={hostRef} className="cos-spotlight-host">
      <div ref={slotRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
});

Spotlight.displayName = 'Spotlight';

export default Spotlight;
