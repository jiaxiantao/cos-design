import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createNewtonCradle, type NewtonCradleController, type NewtonCradleOptions } from '../core';
import '../style/index.css';

export type { NewtonCradleOptions } from '../core/types';

const NewtonCradle = forwardRef<unknown, NewtonCradleOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<NewtonCradleController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createNewtonCradle(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-newtonCradle-host" />;
});

NewtonCradle.displayName = 'NewtonCradle';

export default NewtonCradle;
