import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import { createPhotoFridge, type PhotoFridgeController, type PhotoFridgeOptions } from '../core';
import '../style/index.css';

export type { PhotoFridgeOptions } from '../core/types';

const PhotoFridge = forwardRef<unknown, PhotoFridgeOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoFridgeController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoFridge(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoFridge-host" />;
});

PhotoFridge.displayName = 'PhotoFridge';

export default PhotoFridge;
