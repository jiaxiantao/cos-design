import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createRopeChain, type RopeChainController, type RopeChainOptions } from '../core';
import '../style/index.css';

export type { RopeChainOptions, RopeChainProps } from '../core/types';

const RopeChain = forwardRef<unknown, RopeChainOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RopeChainController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createRopeChain(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-ropeChain-host" />;
});

RopeChain.displayName = 'RopeChain';

export default RopeChain;
