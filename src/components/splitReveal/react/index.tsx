import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSplitReveal, type SplitRevealController, type SplitRevealOptions } from '../core';
import '../style/index.css';

export type { SplitRevealOptions, SplitRevealProps } from '../core/types';

const SplitReveal = forwardRef<unknown, SplitRevealOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SplitRevealController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSplitReveal(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-splitReveal-host" />;
});

SplitReveal.displayName = 'SplitReveal';

export default SplitReveal;
