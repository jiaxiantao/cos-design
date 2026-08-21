import { useEffect, useState, type RefObject } from 'react';
import { observeElementSize, type ElementSize } from './size';

export interface UseElementSizeOptions {
  /** 为 false 时不观察 */
  enabled?: boolean;
}

/** 观察元素尺寸（clientWidth / clientHeight） */
export const useElementSize = <T extends Element>(
  ref: RefObject<T | null>,
  options: UseElementSizeOptions = {}
): ElementSize => {
  const { enabled = true } = options;
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;
    return observeElementSize(element, setSize);
  }, [enabled, ref]);

  return size;
};

export interface CanvasBoxSizeInput {
  /** 为 true 时跟随父容器尺寸（需父级有明确高度） */
  fill?: boolean;
  width?: number;
  height?: number;
  defaultWidth: number;
  defaultHeight: number;
  measured: ElementSize;
}

export interface CanvasBoxSize {
  width: number;
  height: number;
  /** 是否处于 fill 模式且尚未量到有效尺寸 */
  pending: boolean;
}

/** 根据 fill / 显式宽高 / 测量结果解析画布逻辑尺寸 */
export const resolveCanvasBoxSize = ({
  fill = false,
  width,
  height,
  defaultWidth,
  defaultHeight,
  measured
}: CanvasBoxSizeInput): CanvasBoxSize => {
  if (fill) {
    const w = Math.max(0, measured.width);
    const h = Math.max(0, measured.height);
    if (w < 1 || h < 1) {
      return { width: defaultWidth, height: defaultHeight, pending: true };
    }
    return { width: w, height: h, pending: false };
  }

  return {
    width: width ?? defaultWidth,
    height: height ?? defaultHeight,
    pending: false
  };
};
