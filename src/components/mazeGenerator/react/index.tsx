import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { optionsFingerprint } from '@cos-design/shared';
import {
  createMazeGenerator,
  type MazeGeneratorController,
  type MazeGeneratorOptions,
} from '../core';
import '../style/index.css';

export type { MazeGeneratorOptions } from '../core/types';

const MazeGenerator = forwardRef<unknown, MazeGeneratorOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<MazeGeneratorController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const optionsKey = useMemo(() => optionsFingerprint(props), [props]);

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createMazeGenerator(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(propsRef.current);
  }, [optionsKey]);

  return <div ref={hostRef} className="cos-mazeGenerator-host" />;
});

MazeGenerator.displayName = 'MazeGenerator';

export default MazeGenerator;
