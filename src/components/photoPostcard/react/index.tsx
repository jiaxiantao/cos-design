import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createPhotoPostcard,
  type PhotoPostcardController,
  type PhotoPostcardOptions,
} from '../core';
import '../style/index.css';

export type { PhotoPostcardOptions } from '../core/types';

const PhotoPostcard = forwardRef<unknown, PhotoPostcardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoPostcardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoPostcard(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoPostcard-host" />;
});

PhotoPostcard.displayName = 'PhotoPostcard';

export default PhotoPostcard;
