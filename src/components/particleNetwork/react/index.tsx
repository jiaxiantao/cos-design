import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createParticleNetwork,
  type ParticleNetworkController,
  type ParticleNetworkOptions,
} from '../core';
import '../style/index.css';

export type { ParticleNetworkOptions, ParticleNetworkProps } from '../core/types';

const ParticleNetwork = forwardRef<unknown, ParticleNetworkOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ParticleNetworkController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createParticleNetwork(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-particleNetwork-host" />;
});

ParticleNetwork.displayName = 'ParticleNetwork';

export default ParticleNetwork;
