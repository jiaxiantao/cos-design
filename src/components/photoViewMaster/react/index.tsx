import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPhotoViewMaster, type PhotoViewMasterController, type PhotoViewMasterOptions } from '../core';
import '../style/index.css';

export type { PhotoViewMasterOptions, PhotoViewMasterProps } from '../core/types';

const PhotoViewMaster = forwardRef<unknown, PhotoViewMasterOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoViewMasterController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoViewMaster(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoViewMaster-host" />;
});

PhotoViewMaster.displayName = 'PhotoViewMaster';

export default PhotoViewMaster;
