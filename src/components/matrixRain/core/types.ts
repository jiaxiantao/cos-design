export interface MatrixRainOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  density?: number;
  color?: string;
  showOverlay?: boolean;
  title?: string;
  subtitle?: string;
}

export interface MatrixRainController {
  update(options: Partial<MatrixRainOptions>): void;
  destroy(): void;
}

export type MatrixRainProps = MatrixRainOptions;
