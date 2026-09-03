import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createRedPacketRain,
  type RedPacketRainController,
  type RedPacketRainHandle,
  type RedPacketRainOptions,
} from '../core';
import '../style/index.css';

export type { RedPacketRainHandle, RedPacketRainOptions, RedPacketRainProps } from '../core/types';

const RedPacketRain = forwardRef<RedPacketRainHandle, RedPacketRainOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RedPacketRainController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    start: () => ctrlRef.current?.start(),
    stop: () => ctrlRef.current?.stop(),
    reset: () => ctrlRef.current?.reset(),
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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-redPacketRain-host" />;
});

RedPacketRain.displayName = 'RedPacketRain';

export default RedPacketRain;
