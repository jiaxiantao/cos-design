import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createGameOfLife, type GameOfLifeController, type GameOfLifeOptions } from '../core';
import '../style/index.css';

export type { GameOfLifeOptions, GameOfLifeProps } from '../core/types';

const GameOfLife = forwardRef<unknown, GameOfLifeOptions>((props, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<GameOfLifeController | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useImperativeHandle(ref, () => ({}));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ctrl = createGameOfLife(host, propsRef.current);
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.update(props);
  }, [props]);

  return <div ref={hostRef} className="cos-gameOfLife-host" />;
});

GameOfLife.displayName = 'GameOfLife';

export default GameOfLife;
