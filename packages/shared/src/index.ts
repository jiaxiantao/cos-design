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
export {
  applyCanvasHostBox,
  applyBlockHostBox,
  setHidden,
  optionsFingerprint,
  optionsVisualChanged,
} from './host-layout';

// React hooks live at `@cos-design/shared/react` only — keep the default entry framework-free
// so Core / Web Components do not pull React.
