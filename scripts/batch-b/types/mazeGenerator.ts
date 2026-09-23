export interface MazeGeneratorOptions {
  width?: number;
  height?: number;
  cellSize?: number;
  onGenerated?: (cols: number, rows: number) => void;
}

export interface MazeGeneratorController {
  update(options: Partial<MazeGeneratorOptions>): void;
  destroy(): void;
}

export type MazeGeneratorProps = MazeGeneratorOptions;
