import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createBubbleField, type BubbleFieldController, type BubbleFieldOptions } from '../core';
import '../style/index.css';

export type { BubbleFieldOptions, BubbleFieldProps } from '../core/types';

const BubbleField = forwardRef<unknown, BubbleFieldOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<BubbleFieldController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createBubbleField(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-bubbleField-host" />;
});

BubbleField.displayName = 'BubbleField';

export default BubbleField;
