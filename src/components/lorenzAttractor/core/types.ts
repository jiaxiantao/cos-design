export interface LorenzAttractorOptions {
  width?: number;
  height?: number;
  speed?: number;
  color?: string;
  pointCount?: number;
}

export interface LorenzAttractorController {
  update(options: Partial<LorenzAttractorOptions>): void;
  destroy(): void;
}

export type LorenzAttractorProps = LorenzAttractorOptions;
