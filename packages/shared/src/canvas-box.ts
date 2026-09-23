import type { ElementSize } from './size';

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
  measured,
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
    pending: false,
  };
};
