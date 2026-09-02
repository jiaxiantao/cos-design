import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createFuzzyText, type FuzzyTextController, type FuzzyTextOptions } from '../core';
import '../style/index.css';

export type { FuzzyTextOptions, FuzzyTextProps } from '../core/types';

const FuzzyText = forwardRef<unknown, FuzzyTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<FuzzyTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createFuzzyText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-fuzzyText-host" />;
});

FuzzyText.displayName = 'FuzzyText';

export default FuzzyText;
