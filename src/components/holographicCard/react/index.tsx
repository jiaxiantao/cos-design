import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createHolographicCard, type HolographicCardController, type HolographicCardOptions } from '../core';
import '../style/index.css';

export type { HolographicCardOptions, HolographicCardProps } from '../core/types';

const HolographicCard = forwardRef<unknown, HolographicCardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<HolographicCardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createHolographicCard(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-holographicCard-host" />;
});

HolographicCard.displayName = 'HolographicCard';

export default HolographicCard;
