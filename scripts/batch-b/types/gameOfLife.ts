export interface GameOfLifeOptions {
  width?: number;
  height?: number;
  cellSize?: number;
  speed?: number;
  density?: number;
  aliveColor?: string;
  gridColor?: string;
  labels?: Partial<{
    generation: string;
    alive: string;
    pause: string;
    play: string;
    randomize: string;
  }>;
}

export interface GameOfLifeController {
  update(options: Partial<GameOfLifeOptions>): void;
  destroy(): void;
}

export type GameOfLifeProps = GameOfLifeOptions;
