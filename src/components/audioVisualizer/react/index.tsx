import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createAudioVisualizer,
  type AudioVisualizerController,
  type AudioVisualizerOptions,
} from '../core';
import '../style/index.css';

export type { AudioVisualizerOptions, AudioVisualizerProps } from '../core/types';

const AudioVisualizer = forwardRef<unknown, AudioVisualizerOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AudioVisualizerController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createAudioVisualizer(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-audioVisualizer-host" />;
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;
