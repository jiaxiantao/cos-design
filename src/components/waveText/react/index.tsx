import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createWaveText, type WaveTextController, type WaveTextOptions } from '../core';
import '../style/index.css';

export type { WaveTextOptions, WaveTextProps } from '../core/types';

const WaveText = forwardRef<unknown, WaveTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<WaveTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createWaveText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-waveText-host" />;
});

WaveText.displayName = 'WaveText';

export default WaveText;
