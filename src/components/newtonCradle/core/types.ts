export interface NewtonCradleOptions {
  ballCount?: number;
  color?: string;
  width?: number;
  height?: number;
}

export interface NewtonCradleController {
  update(options: Partial<NewtonCradleOptions>): void;
  destroy(): void;
}

export type NewtonCradleProps = NewtonCradleOptions;
