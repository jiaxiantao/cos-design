import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createMagneticButton,
  type MagneticButtonController,
  type MagneticButtonOptions,
} from '../core';
import '../style/index.css';

export type { MagneticButtonOptions, MagneticButtonProps } from '../core/types';

type SlotProps = MagneticButtonOptions & { children?: React.ReactNode };

const MagneticButton = forwardRef<unknown, SlotProps>(({ children, ...props }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<MagneticButtonController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    const slot = slotRef.current;
    if (!host || !slot) return;
    const ctrl = createMagneticButton(host, { ...propsRef.current, slotElement: slot });
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
    <div ref={hostRef} className="cos-magneticButton-host">
      <div ref={slotRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
});

MagneticButton.displayName = 'MagneticButton';

export default MagneticButton;
