import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createAudioVisualizer,
  type AudioVisualizerController,
  type AudioVisualizerOptions,
} from '../core';
import '../style/index.css';

export type { AudioVisualizerOptions } from '../core/types';

const AudioVisualizer = forwardRef<unknown, AudioVisualizerOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AudioVisualizerController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-audioVisualizer-host" />;
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;
