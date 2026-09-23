export interface SandFallOptions {
  width?: number;
  height?: number;
  cellSize?: number;
  colors?: string[];
  spawnRate?: number;
  hint?: string;
  clearText?: string;
}

export interface SandFallController {
  update(options: Partial<SandFallOptions>): void;
  destroy(): void;
}

export type SandFallProps = SandFallOptions;
