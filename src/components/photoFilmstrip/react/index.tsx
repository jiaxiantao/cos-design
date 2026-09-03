import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createPhotoFilmstrip,
  type PhotoFilmstripController,
  type PhotoFilmstripOptions,
} from '../core';
import '../style/index.css';

export type { PhotoFilmstripOptions } from '../core/types';

const PhotoFilmstrip = forwardRef<unknown, PhotoFilmstripOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoFilmstripController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoFilmstrip-host" />;
});

PhotoFilmstrip.displayName = 'PhotoFilmstrip';

export default PhotoFilmstrip;
