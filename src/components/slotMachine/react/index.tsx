import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createSlotMachine, type SlotMachineController, type SlotMachineOptions } from '../core';
import type { SlotMachineHandle } from '../core/types';
import '../style/index.css';

export type { SlotMachineOptions, SlotMachineHandle } from '../core/types';

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SlotMachineController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    spin: (...args: any[]) => (ctrlRef.current as any)?.spin?.(...args),
    reset: (...args: any[]) => (ctrlRef.current as any)?.reset?.(...args),
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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-slotMachine-host" />;
});

SlotMachine.displayName = 'SlotMachine';

export default SlotMachine;
