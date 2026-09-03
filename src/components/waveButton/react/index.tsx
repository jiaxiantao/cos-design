import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createWaveButton, type WaveButtonController, type WaveButtonOptions } from '../core';
import '../style/index.css';

export type { WaveButtonOptions, WaveButtonProps } from '../core/types';

type BtnProps = WaveButtonOptions & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const WaveButton = forwardRef<HTMLButtonElement, BtnProps>(
  ({ text, color, className, style, ...rest }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const ctrlRef = useRef<WaveButtonController | null>(null);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const propsRef = useRef({ text, color, className, style, buttonProps: rest });
    propsRef.current = { text, color, className, style, buttonProps: rest };

    useImperativeHandle(ref, () => btnRef.current as HTMLButtonElement);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const ctrl = createWaveButton(host, propsRef.current);
      btnRef.current = ctrl.getButton();
      ctrlRef.current = ctrl;
      return () => {
        ctrl.destroy();
        ctrlRef.current = null;
        btnRef.current = null;
      };
    }, []);

    useEffect(() => {
      ctrlRef.current?.update(propsRef.current);
      btnRef.current = ctrlRef.current?.getButton() ?? null;
    }, [text, color, className, style, rest]);

    return <div ref={hostRef} className="cos-waveButton-host" />;
  },
);

WaveButton.displayName = 'WaveButton';

export default WaveButton;
