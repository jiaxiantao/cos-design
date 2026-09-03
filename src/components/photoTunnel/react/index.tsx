import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createPhotoTunnel, type PhotoTunnelController, type PhotoTunnelOptions } from '../core';
import '../style/index.css';

export type { PhotoTunnelOptions } from '../core/types';

const PhotoTunnel = forwardRef<unknown, PhotoTunnelOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoTunnelController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoTunnel(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoTunnel-host" />;
});

PhotoTunnel.displayName = 'PhotoTunnel';

export default PhotoTunnel;
