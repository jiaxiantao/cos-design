import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createFlipCard, type FlipCardController, type FlipCardHandle, type FlipCardOptions } from '../core';
import '../style/index.css';

export type { FlipCardHandle, FlipCardOptions, FlipCardProps } from '../core/types';

const FlipCard = forwardRef<FlipCardHandle, FlipCardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<FlipCardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    flip: () => ctrlRef.current?.flip(),
    reset: () => ctrlRef.current?.reset()
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createFlipCard(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-flipCard-host" />;
});

FlipCard.displayName = 'FlipCard';

export default FlipCard;
