import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createPhotoPostcard,
  type PhotoPostcardController,
  type PhotoPostcardOptions,
} from '../core';
import '../style/index.css';

export type { PhotoPostcardOptions, PhotoPostcardProps } from '../core/types';

const PhotoPostcard = forwardRef<unknown, PhotoPostcardOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoPostcardController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoPostcard-host" />;
});

PhotoPostcard.displayName = 'PhotoPostcard';

export default PhotoPostcard;
