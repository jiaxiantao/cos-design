import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createMatrixRain, type MatrixRainController, type MatrixRainOptions } from '../core';
import '../style/index.css';

export type { MatrixRainOptions, MatrixRainProps } from '../core/types';

const MatrixRain = forwardRef<unknown, MatrixRainOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<MatrixRainController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createMatrixRain(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-matrixRain-host" />;
});

MatrixRain.displayName = 'MatrixRain';

export default MatrixRain;
