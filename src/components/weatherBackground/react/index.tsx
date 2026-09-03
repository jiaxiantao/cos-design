import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createWeatherBackground, type WeatherBackgroundController, type WeatherBackgroundOptions } from '../core';
import '../style/index.css';

export type { WeatherBackgroundOptions, WeatherBackgroundProps } from '../core/types';
export { formatLocalHm, mapWmoCodeToWeatherType, useLiveWeather, useSunTimes } from '../live-weather';
export type { LiveWeatherCoords, LiveWeatherState, LiveWeatherStatus, OpenMeteoCurrent } from '../live-weather';

const WeatherBackground = forwardRef<unknown, WeatherBackgroundOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<WeatherBackgroundController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-weatherBackground-host" />;
});

WeatherBackground.displayName = 'WeatherBackground';

export default WeatherBackground;
