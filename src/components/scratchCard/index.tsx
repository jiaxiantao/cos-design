import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style/index.module.less';

export interface ScratchCardProps {
  /** 涂层颜色 */
  coverColor?: string;
  /** 奖品文字 */
  prize?: string;
  /** 刮开完成回调 */
  onReveal?: () => void;
  width?: number;
  height?: number;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  coverColor = '#94a3b8',
  prize = '🎉 恭喜中奖！',
  onReveal,
  width = 300,
  height = 180
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const revealedRef = useRef(false);
  const onRevealRef = useRef(onReveal);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const drawCover = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = coverColor;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgb(255 255 255 / 30%)';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('刮开涂层', width / 2, height / 2);
    },
    [coverColor, height, width]
  );

  const checkReveal = useCallback((canvas: HTMLCanvasElement) => {
    if (revealedRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) transparent++;
    }
    const ratio = transparent / (canvas.width * canvas.height);
    if (ratio > 0.45) {
      revealedRef.current = true;
      setRevealed(true);
      onRevealRef.current?.();
    }
  }, []);

  useEffect(() => {
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

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const pos = getPos(e);
    if (pos) scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    if (pos) scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

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
};

export default ScratchCard;
