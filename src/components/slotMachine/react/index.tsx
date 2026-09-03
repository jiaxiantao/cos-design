import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createSlotMachine,
  type SlotMachineController,
  type SlotMachineHandle,
  type SlotMachineOptions,
} from '../core';
import '../style/index.css';

export type { SlotMachineHandle, SlotMachineOptions, SlotMachineProps } from '../core/types';

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SlotMachineController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    spin: (results?: string[]) => ctrlRef.current?.spin(results),
    reset: () => ctrlRef.current?.reset(),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createSlotMachine(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-slotMachine-host" />;
});

SlotMachine.displayName = 'SlotMachine';

export default SlotMachine;
