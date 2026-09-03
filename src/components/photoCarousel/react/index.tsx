import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createPhotoCarousel,
  type PhotoCarouselController,
  type PhotoCarouselOptions,
} from '../core';
import '../style/index.css';

export type { PhotoCarouselOptions, PhotoCarouselProps } from '../core/types';

const PhotoCarousel = forwardRef<unknown, PhotoCarouselOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoCarouselController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

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
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoCarousel-host" />;
});

PhotoCarousel.displayName = 'PhotoCarousel';

export default PhotoCarousel;
