import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createOrbitalChart, type OrbitalChartController, type OrbitalChartOptions } from '../core';
import '../style/index.css';

export type { OrbitalChartOptions } from '../core/types';

const OrbitalChart = forwardRef<unknown, OrbitalChartOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<OrbitalChartController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createOrbitalChart(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-orbitalChart-host" />;
});

OrbitalChart.displayName = 'OrbitalChart';

export default OrbitalChart;
