import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createGravityBalls, type GravityBallsController, type GravityBallsOptions } from '../core';
import '../style/index.css';

export type { GravityBallsOptions, GravityBallsProps } from '../core/types';

const GravityBalls = forwardRef<unknown, GravityBallsOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<GravityBallsController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createGravityBalls(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-gravityBalls-host" />;
});

GravityBalls.displayName = 'GravityBalls';

export default GravityBalls;
