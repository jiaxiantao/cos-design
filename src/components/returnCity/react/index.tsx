import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createReturnCity, type ReturnCityController, type ReturnCityOptions } from '../core';
import '../style/index.css';

export type { ReturnCityOptions, ReturnCityProps } from '../core/types';

const ReturnCity = forwardRef<unknown, ReturnCityOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ReturnCityController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createReturnCity(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-returnCity-host" />;
});

ReturnCity.displayName = 'ReturnCity';

export default ReturnCity;
