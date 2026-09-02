export { clamp, lerp } from './math';
export { bindVisibilityPause } from './visibility';
export { prefersReducedMotion, bindPrefersReducedMotion } from './reduced-motion';
export { observeElementSize } from './size';
export type { ElementSize } from './size';
export { getRelativePointerPosition } from './pointer';
export type { PointerPosition } from './pointer';
export type { PhotoItem, PhotoIndexChangeHandler, PhotoFaceChangeHandler } from './photo';
export { resolveCanvasBoxSize } from './canvas-box';
export type { CanvasBoxSizeInput, CanvasBoxSize } from './canvas-box';

/** @deprecated v4: import from `@cos-design/shared/react` */
export { useElementSize, useCanvasBox } from './react';
/** @deprecated v4: import types from `@cos-design/shared/react` */
export type { UseElementSizeOptions, UseCanvasBoxOptions, UseCanvasBoxResult } from './react';
