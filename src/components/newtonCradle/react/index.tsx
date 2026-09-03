import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createNewtonCradle, type NewtonCradleController, type NewtonCradleOptions } from '../core';
import '../style/index.css';

export type { NewtonCradleOptions, NewtonCradleProps } from '../core/types';

const NewtonCradle = forwardRef<unknown, NewtonCradleOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<NewtonCradleController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-newtonCradle-host" />;
});

NewtonCradle.displayName = 'NewtonCradle';

export default NewtonCradle;
