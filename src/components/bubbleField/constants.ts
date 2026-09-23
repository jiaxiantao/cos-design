import type { PointerState } from './types';

export const BLOB_SEGMENTS = 48;
export const META_SEGMENTS = 56;
export const LIGHT_X = 0.82;
export const LIGHT_Y = 0.08;
export const MAX_RADIUS = 46;
export const MAX_DPR = 2;
export const FRAME_MS = 1000 / 60;
export const MERGE_CELL_SIZE = MAX_RADIUS * 2.6;

export const createPointerState = (): PointerState => ({
  x: -1000,
  y: -1000,
  prevX: -1000,
  prevY: -1000,
  vx: 0,
  vy: 0,
  speed: 0,
  active: false,
  lastTs: 0,
});
