import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createParticleNetwork,
  type ParticleNetworkController,
  type ParticleNetworkOptions,
} from '../core';
import '../style/index.css';

export type { ParticleNetworkOptions } from '../core/types';

const ParticleNetwork = forwardRef<unknown, ParticleNetworkOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ParticleNetworkController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-particleNetwork-host" />;
});

ParticleNetwork.displayName = 'ParticleNetwork';

export default ParticleNetwork;
