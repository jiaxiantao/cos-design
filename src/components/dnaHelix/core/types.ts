export interface DnaHelixOptions {
  width?: number;
  height?: number;
  speed?: number;
  color?: string;
}

export interface DnaHelixController {
  update(options: Partial<DnaHelixOptions>): void;
  destroy(): void;
}

export type DnaHelixProps = DnaHelixOptions;
