import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createRedPacketRain,
  type RedPacketRainController,
  type RedPacketRainOptions,
} from '../core';
import type { RedPacketRainHandle } from '../core/types';
import '../style/index.css';

export type { RedPacketRainOptions, RedPacketRainHandle } from '../core/types';

const RedPacketRain = forwardRef<RedPacketRainHandle, RedPacketRainOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RedPacketRainController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({
    start: (...args: any[]) => (ctrlRef.current as any)?.start?.(...args),
    stop: (...args: any[]) => (ctrlRef.current as any)?.stop?.(...args),
    reset: (...args: any[]) => (ctrlRef.current as any)?.reset?.(...args),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createRedPacketRain(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-redPacketRain-host" />;
});

RedPacketRain.displayName = 'RedPacketRain';

export default RedPacketRain;
