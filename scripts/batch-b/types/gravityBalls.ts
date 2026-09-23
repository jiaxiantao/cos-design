export interface GravityBallsOptions {
  width?: number;
  height?: number;
  ballCount?: number;
}

export interface GravityBallsController {
  update(options: Partial<GravityBallsOptions>): void;
  destroy(): void;
}

export type GravityBallsProps = GravityBallsOptions;
