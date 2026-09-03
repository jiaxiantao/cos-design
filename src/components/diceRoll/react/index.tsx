import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createDiceRoll, type DiceRollController, type DiceRollOptions } from '../core';
import '../style/index.css';

export type { DiceRollOptions, DiceRollProps } from '../core/types';

const DiceRoll = forwardRef<unknown, DiceRollOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<DiceRollController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createDiceRoll(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-diceRoll-host" />;
});

DiceRoll.displayName = 'DiceRoll';

export default DiceRoll;
