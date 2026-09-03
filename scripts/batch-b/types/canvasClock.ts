export interface CanvasClockOptions {
  width?: number;
  height?: number;
}

export interface CanvasClockController {
  update(options: Partial<CanvasClockOptions>): void;
  destroy(): void;
}

export type CanvasClockProps = CanvasClockOptions;
