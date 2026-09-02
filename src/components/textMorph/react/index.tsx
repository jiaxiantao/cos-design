import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createTextMorph, type TextMorphController, type TextMorphOptions } from '../core';
import '../style/index.css';

export type { TextMorphOptions, TextMorphProps } from '../core/types';

const TextMorph = forwardRef<unknown, TextMorphOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<TextMorphController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createTextMorph(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-textMorph-host" />;
});

TextMorph.displayName = 'TextMorph';

export default TextMorph;
