import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { getRelativePointerPosition } from '@cos-design/shared';
import styles from './style/index.module.less';

export interface ScratchCardProps {
  /** 涂层颜色 */
  coverColor?: string;
  /** 奖品文字 */
  prize?: string;
  /** 涂层上的提示文案 */
  coverText?: string;
  /** 刮开面积比例阈值（0~1），默认 0.45 */
  revealThreshold?: number;
  /** 刮开完成回调 */
  onReveal?: () => void;
  width?: number;
  height?: number;
}

export interface ScratchCardHandle {
  /** 重置涂层 */
  reset: () => void;
  /** 立即揭开奖品 */
  reveal: () => void;
}

const ScratchCard = forwardRef<ScratchCardHandle, ScratchCardProps>(
  (
    {
      coverColor = '#94a3b8',
      prize = '🎉 恭喜中奖！',
      coverText = '刮开涂层',
      revealThreshold = 0.45,
      onReveal,
      width = 300,
      height = 180
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const revealedRef = useRef(false);
    const onRevealRef = useRef(onReveal);
    const revealThresholdRef = useRef(revealThreshold);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
      onRevealRef.current = onReveal;
    }, [onReveal]);

    useEffect(() => {
      revealThresholdRef.current = revealThreshold;
    }, [revealThreshold]);

    const drawCover = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = coverColor;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgb(255 255 255 / 30%)';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(coverText, width / 2, height / 2);
      },
      [coverColor, coverText, height, width]
    );

    const paintCover = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCover(ctx);
    }, [drawCover, height, width]);

    const finishReveal = useCallback(() => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      setRevealed(true);
      onRevealRef.current?.();
    }, []);

    const checkReveal = useCallback(
      (canvas: HTMLCanvasElement) => {
        if (revealedRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] < 128) transparent++;
        }
        const ratio = transparent / (canvas.width * canvas.height);
        if (ratio > revealThresholdRef.current) {
          finishReveal();
        }
      },
      [finishReveal]
    );

    useEffect(() => {
      revealedRef.current = false;
      setRevealed(false);
      paintCover();
    }, [paintCover]);

    const scratch = (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || revealedRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      checkReveal(canvas);
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e) e.preventDefault();
      isDrawing.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const pos = getRelativePointerPosition(canvas, e.nativeEvent);
      if (pos) scratch(pos.x, pos.y);
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return;
      if ('touches' in e) e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const pos = getRelativePointerPosition(canvas, e.nativeEvent);
      if (pos) scratch(pos.x, pos.y);
    };

    const handleEnd = () => {
      isDrawing.current = false;
    };

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          revealedRef.current = false;
          setRevealed(false);
          paintCover();
        },
        reveal: () => {
          finishReveal();
        }
      }),
      [finishReveal, paintCover]
    );

    return (
      <div className={styles.scratchCard} style={{ width, height }}>
        <div className={styles.prize}>{prize}</div>
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${revealed ? styles.hidden : ''}`}
          style={{ width, height }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    );
  }
);

ScratchCard.displayName = 'ScratchCard';

export default ScratchCard;
