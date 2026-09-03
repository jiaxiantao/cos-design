import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSpringMass, type SpringMassController, type SpringMassOptions } from '../core';
import '../style/index.css';

export type { SpringMassOptions, SpringMassProps } from '../core/types';

const SpringMass = forwardRef<unknown, SpringMassOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpringMassController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSpringMass(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-springMass-host" />;
});

SpringMass.displayName = 'SpringMass';

export default SpringMass;
