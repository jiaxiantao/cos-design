import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPhotoLantern, type PhotoLanternController, type PhotoLanternOptions } from '../core';
import '../style/index.css';

export type { PhotoLanternOptions, PhotoLanternProps } from '../core/types';

const PhotoLantern = forwardRef<unknown, PhotoLanternOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoLanternController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoLantern(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoLantern-host" />;
});

PhotoLantern.displayName = 'PhotoLantern';

export default PhotoLantern;
