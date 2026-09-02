import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createTrueFocus, type TrueFocusController, type TrueFocusOptions } from '../core';
import '../style/index.css';

export type { TrueFocusOptions, TrueFocusProps } from '../core/types';

const TrueFocus = forwardRef<unknown, TrueFocusOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TrueFocusController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createTrueFocus(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-trueFocus-host" />;
});

TrueFocus.displayName = 'TrueFocus';

export default TrueFocus;
