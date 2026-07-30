import React, { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from 'react';
import styles from './style/index.module.less';

export interface CurvedLoopProps {
  /** 跑马灯文案 */
  text?: string;
  /** 滚动速度（像素/帧） */
  speed?: number;
  /** 曲线幅度 */
  curveAmount?: number;
  /** 初始方向 */
  direction?: 'left' | 'right';
  /** 是否可拖拽 */
  interactive?: boolean;
  /** 文字颜色 */
  color?: string;
  /** 字号（相对 SVG） */
  fontSize?: number;
}

const CurvedLoop: React.FC<CurvedLoopProps> = ({
  text = 'COS DESIGN ✦ CURVED LOOP ✦ ',
  speed = 2,
  curveAmount = 80,
  direction = 'left',
  interactive = true,
  color = '#f8fafc',
  fontSize = 56
}) => {
  const marqueeText = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(text);
    return (hasTrailing ? text.replace(/\s+$/, '') : text) + '\u00A0';
  }, [text]);

  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid.replace(/:/g, '')}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const velRef = useRef(0);

  const totalText = spacing
    ? Array(Math.ceil(1800 / spacing) + 2)
        .fill(marqueeText)
        .join('')
    : marqueeText;
  const ready = spacing > 0;

  useEffect(() => {
    dirRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
  }, [marqueeText, fontSize]);

  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    const initial = -spacing;
    textPathRef.current.setAttribute('startOffset', `${initial}px`);
    setOffset(initial);
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = Number.parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + delta;
        if (newOffset <= -spacing) newOffset += spacing;
        if (newOffset > 0) newOffset -= spacing;
        textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ready, spacing, speed]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    const currentOffset = Number.parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
    let newOffset = currentOffset + dx;
    if (newOffset <= -spacing) newOffset += spacing;
    if (newOffset > 0) newOffset -= spacing;
    textPathRef.current.setAttribute('startOffset', `${newOffset}px`);
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
  };

  return (
    <div
      className={styles.curvedLoop}
      style={
        {
          visibility: ready ? 'visible' : 'hidden',
          cursor: interactive ? 'grab' : 'default',
          '--curve-color': color,
          '--curve-font-size': `${fontSize}px`
        } as React.CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className={styles.svg} viewBox="0 0 1440 120">
        <text ref={measureRef} xmlSpace="preserve" className={styles.measure}>
          {marqueeText}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text xmlSpace="preserve" className={styles.pathText}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={`${offset}px`} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
