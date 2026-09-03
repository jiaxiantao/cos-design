import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createPhotoPolaroid,
  type PhotoPolaroidController,
  type PhotoPolaroidOptions,
} from '../core';
import '../style/index.css';

export type { PhotoPolaroidOptions } from '../core/types';

const PhotoPolaroid = forwardRef<unknown, PhotoPolaroidOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<PhotoPolaroidController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

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
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-photoPolaroid-host" />;
});

PhotoPolaroid.displayName = 'PhotoPolaroid';

export default PhotoPolaroid;
