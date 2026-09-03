import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createPhotoFilmstrip,
  type PhotoFilmstripController,
  type PhotoFilmstripOptions,
} from '../core';
import '../style/index.css';

export type { PhotoFilmstripOptions, PhotoFilmstripProps } from '../core/types';

const PhotoFilmstrip = forwardRef<unknown, PhotoFilmstripOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoFilmstripController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createPhotoFilmstrip(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-photoFilmstrip-host" />;
});

PhotoFilmstrip.displayName = 'PhotoFilmstrip';

export default PhotoFilmstrip;
