import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createPhotoLightbox,
  type PhotoLightboxController,
  type PhotoLightboxOptions,
} from '../core';
import '../style/index.css';

export type { PhotoLightboxOptions, PhotoLightboxProps } from '../core/types';

const PhotoLightbox = forwardRef<unknown, PhotoLightboxOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoLightboxController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoLightbox(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoLightbox-host" />;
});

PhotoLightbox.displayName = 'PhotoLightbox';

export default PhotoLightbox;
