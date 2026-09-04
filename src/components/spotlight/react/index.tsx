import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createSpotlight, type SpotlightController, type SpotlightOptions } from '../core';
import '../style/index.css';

export type { SpotlightOptions } from '../core/types';

type SlotProps = SpotlightOptions & { children?: React.ReactNode };

const Spotlight = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpotlightController | null>(null);
  const propsRef = useRef(props);
  const childrenRef = useRef(children);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  propsRef.current = props;
  childrenRef.current = children;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  const toOptions = (): SpotlightOptions => {
    if (childrenRef.current != null) return { ...propsRef.current, defaultContent: undefined };
    return propsRef.current;
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSpotlight(host, toOptions());
    ctrlRef.current = ctrl;
    setSlotEl(typeof ctrl.getSlot === 'function' ? ctrl.getSlot() : null);
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
      setSlotEl(null);
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(toOptions());
  }, [optionsKey, children]);

  return (
    <div ref={hostRef} className="cos-spotlight-host">
      {slotEl && children != null ? createPortal(children, slotEl) : null}
    </div>
  );
});

Spotlight.displayName = 'Spotlight';

export default Spotlight;
