import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createNetworkGraph, type NetworkGraphController, type NetworkGraphOptions } from '../core';
import '../style/index.css';

export type { NetworkGraphOptions, NetworkGraphProps } from '../core/types';

const NetworkGraph = forwardRef<unknown, NetworkGraphOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<NetworkGraphController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createNetworkGraph(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-networkGraph-host" />;
});

NetworkGraph.displayName = 'NetworkGraph';

export default NetworkGraph;
