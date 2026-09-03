import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createPhotoClothesline,
  type PhotoClotheslineController,
  type PhotoClotheslineOptions,
} from '../core';
import '../style/index.css';

export type { PhotoClotheslineOptions } from '../core/types';

const PhotoClothesline = forwardRef<unknown, PhotoClotheslineOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoClotheslineController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoClothesline(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoClothesline-host" />;
});

PhotoClothesline.displayName = 'PhotoClothesline';

export default PhotoClothesline;
