import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createReturnCity, type ReturnCityController, type ReturnCityOptions } from '../core';
import '../style/index.css';

export type { ReturnCityOptions } from '../core/types';

const ReturnCity = forwardRef<unknown, ReturnCityOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ReturnCityController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-returnCity-host" />;
});

ReturnCity.displayName = 'ReturnCity';

export default ReturnCity;
