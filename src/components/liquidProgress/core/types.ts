export interface LiquidProgressOptions {
  value?: number;
  max?: number;
  size?: number;
  color?: string;
}

export interface LiquidProgressController {
  update(options: Partial<LiquidProgressOptions>): void;
  destroy(): void;
}

export type LiquidProgressProps = LiquidProgressOptions;
