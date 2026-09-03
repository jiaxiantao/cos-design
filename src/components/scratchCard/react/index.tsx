import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createScratchCard,
  type ScratchCardController,
  type ScratchCardHandle,
  type ScratchCardOptions,
} from '../core';
import '../style/index.css';

export type { ScratchCardHandle, ScratchCardOptions, ScratchCardProps } from '../core/types';

const ScratchCard = forwardRef<ScratchCardHandle, ScratchCardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ScratchCardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    reset: () => ctrlRef.current?.reset(),
    reveal: () => ctrlRef.current?.reveal(),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createScratchCard(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-scratchCard-host" />;
});

ScratchCard.displayName = 'ScratchCard';

export default ScratchCard;
