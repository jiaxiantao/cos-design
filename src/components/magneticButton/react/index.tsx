import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createMagneticButton,
  type MagneticButtonController,
  type MagneticButtonOptions,
} from '../core';
import '../style/index.css';

export type { MagneticButtonOptions } from '../core/types';

type SlotProps = MagneticButtonOptions & { children?: React.ReactNode };

const MagneticButton = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<MagneticButtonController | null>(null);
  const propsRef = useRef(props);
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createMagneticButton(host, propsRef.current);
    ctrlRef.current = ctrl;
    setSlotEl(typeof ctrl.getSlot === 'function' ? ctrl.getSlot() : null);
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
      setSlotEl(null);
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return (
    <div ref={hostRef} className="cos-magneticButton-host">
      {slotEl && children != null ? createPortal(children, slotEl) : null}
    </div>
  );
});

MagneticButton.displayName = 'MagneticButton';

export default MagneticButton;
