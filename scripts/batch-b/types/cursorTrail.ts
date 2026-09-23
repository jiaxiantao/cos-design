export interface CursorTrailOptions {
  color?: string;
  length?: number;
  width?: number;
  height?: number;
  hint?: string;
}

export interface CursorTrailController {
  update(options: Partial<CursorTrailOptions>): void;
  destroy(): void;
}

export type CursorTrailProps = CursorTrailOptions;
