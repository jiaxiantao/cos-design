export interface SpeedometerOptions {
  value?: number;
  max?: number;
  label?: string;
  color?: string;
}

export interface SpeedometerController {
  update(options: Partial<SpeedometerOptions>): void;
  destroy(): void;
}

export type SpeedometerProps = SpeedometerOptions;
