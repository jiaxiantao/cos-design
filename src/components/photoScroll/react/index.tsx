import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPhotoScroll, type PhotoScrollController, type PhotoScrollOptions } from '../core';
import '../style/index.css';

export type { PhotoScrollOptions, PhotoScrollProps } from '../core/types';

const PhotoScroll = forwardRef<unknown, PhotoScrollOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoScrollController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoScroll(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoScroll-host" />;
});

PhotoScroll.displayName = 'PhotoScroll';

export default PhotoScroll;
