import React, { useEffect, useRef } from 'react';
import styles from './style/index.module.less';

export interface FuzzyTextProps {
  /** 显示文字 */
  text?: string;
  /** 字号 */
  fontSize?: number;
  /** 字重 */
  fontWeight?: number;
  /** 颜色 */
  color?: string;
  /** 基础抖动强度 0~1 */
  baseIntensity?: number;
  /** 悬停抖动强度 0~1 */
  hoverIntensity?: number;
  /** 是否启用悬停增强 */
  enableHover?: boolean;
  /** 抖动像素范围 */
  fuzzRange?: number;
}

type FuzzyCanvas = HTMLCanvasElement & { cleanupFuzzyText?: () => void };

const FuzzyText: React.FC<FuzzyTextProps> = ({
  text = 'FUZZY',
  fontSize = 72,
  fontWeight = 900,
  color = '#f8fafc',
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  enableHover = true,
  fuzzRange = 30
}) => {
  const canvasRef = useRef<FuzzyCanvas>(null);

  useEffect(() => {
    let animationFrameId = 0;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const fontFamily = window.getComputedStyle(canvas).fontFamily || 'sans-serif';
      const fontSizeStr = `${fontSize}px`;
      const fontString = `${fontWeight} ${fontSizeStr} ${fontFamily}`;

      try {
        await document.fonts.load(fontString);
      } catch {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = fontString;
      offCtx.textBaseline = 'alphabetic';

      const metrics = offCtx.measureText(text);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? fontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2;
      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);
      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;
      offCtx.font = fontString;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      offCtx.fillText(text, extraWidthBuffer / 2 - actualLeft, actualAscent);

      const horizontalMargin = fuzzRange + 20;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(horizontalMargin, 0);

      const interactiveLeft = horizontalMargin + extraWidthBuffer / 2;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = tightHeight;

      let isHovering = false;

      const run = () => {
        if (isCancelled) return;
        const intensity = isHovering ? hoverIntensity : baseIntensity;
        ctx.clearRect(-fuzzRange - 20, -10, offscreenWidth + 2 * (fuzzRange + 20), tightHeight + 20);

        for (let j = 0; j < tightHeight; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
        }
        animationFrameId = window.requestAnimationFrame(run);
      };

      animationFrameId = window.requestAnimationFrame(run);

      const isInsideTextArea = (x: number, y: number) =>
        x >= interactiveLeft && x <= interactiveRight && y >= 0 && y <= interactiveBottom;

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        isHovering = isInsideTextArea(e.clientX - rect.left, e.clientY - rect.top);
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      if (enableHover) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
      }

      canvas.cleanupFuzzyText = () => {
        window.cancelAnimationFrame(animationFrameId);
        if (enableHover) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    };

    void init();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      canvas.cleanupFuzzyText?.();
    };
  }, [baseIntensity, color, enableHover, fontSize, fontWeight, fuzzRange, hoverIntensity, text]);

  return (
    <div className={styles.fuzzyText}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};

export default FuzzyText;
