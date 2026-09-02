import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createGradientFlow, type GradientFlowController, type GradientFlowOptions } from '../core';
import '../style/index.css';

export type { GradientFlowOptions, GradientFlowProps } from '../core/types';

const GradientFlow = forwardRef<unknown, GradientFlowOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<GradientFlowController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createGradientFlow(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-gradientFlow-host" />;
});

GradientFlow.displayName = 'GradientFlow';

export default GradientFlow;
