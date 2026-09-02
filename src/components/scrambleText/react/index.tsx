import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createScrambleText, type ScrambleTextController, type ScrambleTextOptions } from '../core';
import '../style/index.css';

export type { ScrambleTextOptions, ScrambleTextProps } from '../core/types';

const ScrambleText = forwardRef<unknown, ScrambleTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ScrambleTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createScrambleText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-scrambleText-host" />;
});

ScrambleText.displayName = 'ScrambleText';

export default ScrambleText;
