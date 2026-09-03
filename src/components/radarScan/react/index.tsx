import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createRadarScan, type RadarScanController, type RadarScanOptions } from '../core';
import '../style/index.css';

export type { RadarScanOptions, RadarScanProps } from '../core/types';

const RadarScan = forwardRef<unknown, RadarScanOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RadarScanController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createRadarScan(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-radarScan-host" />;
});

RadarScan.displayName = 'RadarScan';

export default RadarScan;
