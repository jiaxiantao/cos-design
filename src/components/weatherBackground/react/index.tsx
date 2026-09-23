import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createWeatherBackground,
  type WeatherBackgroundController,
  type WeatherBackgroundOptions,
} from '../core';
import '../style/index.css';

export type { WeatherBackgroundOptions } from '../core/types';

const WeatherBackground = forwardRef<unknown, WeatherBackgroundOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<WeatherBackgroundController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createWeatherBackground(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-weatherBackground-host" />;
});

WeatherBackground.displayName = 'WeatherBackground';

export default WeatherBackground;
