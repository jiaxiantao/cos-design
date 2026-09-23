import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createScrambleText, type ScrambleTextController, type ScrambleTextOptions } from '../core';
import '../style/index.css';

export type { ScrambleTextOptions } from '../core/types';

const ScrambleText = forwardRef<unknown, ScrambleTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ScrambleTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-scrambleText-host" />;
});

ScrambleText.displayName = 'ScrambleText';

export default ScrambleText;
