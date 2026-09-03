import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createPhotoCarousel,
  type PhotoCarouselController,
  type PhotoCarouselOptions,
} from '../core';
import '../style/index.css';

export type { PhotoCarouselOptions } from '../core/types';

const PhotoCarousel = forwardRef<unknown, PhotoCarouselOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoCarouselController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoCarousel(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoCarousel-host" />;
});

PhotoCarousel.displayName = 'PhotoCarousel';

export default PhotoCarousel;
