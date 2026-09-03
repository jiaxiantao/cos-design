import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPhotoAlbum, type PhotoAlbumController, type PhotoAlbumOptions } from '../core';
import '../style/index.css';

export type { PhotoAlbumOptions, PhotoAlbumProps } from '../core/types';

const PhotoAlbum = forwardRef<unknown, PhotoAlbumOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoAlbumController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoAlbum(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoAlbum-host" />;
});

PhotoAlbum.displayName = 'PhotoAlbum';

export default PhotoAlbum;
