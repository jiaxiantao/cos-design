import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPhotoPrism, type PhotoPrismController, type PhotoPrismOptions } from '../core';
import '../style/index.css';

export type { PhotoPrismOptions, PhotoPrismProps } from '../core/types';

const PhotoPrism = forwardRef<unknown, PhotoPrismOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoPrismController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoPrism(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoPrism-host" />;
});

PhotoPrism.displayName = 'PhotoPrism';

export default PhotoPrism;
