import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSplitText, type SplitTextController, type SplitTextOptions } from '../core';
import '../style/index.css';

export type { SplitTextOptions, SplitTextProps } from '../core/types';

const SplitText = forwardRef<unknown, SplitTextOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SplitTextController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSplitText(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-splitText-host" />;
});

SplitText.displayName = 'SplitText';

export default SplitText;
