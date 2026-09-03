import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createPhotoPolaroid,
  type PhotoPolaroidController,
  type PhotoPolaroidOptions,
} from '../core';
import '../style/index.css';

export type { PhotoPolaroidOptions, PhotoPolaroidProps } from '../core/types';

const PhotoPolaroid = forwardRef<unknown, PhotoPolaroidOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoPolaroidController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoPolaroid(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoPolaroid-host" />;
});

PhotoPolaroid.displayName = 'PhotoPolaroid';

export default PhotoPolaroid;
