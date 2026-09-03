export interface LavaBubbleOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  heat?: number;
  speed?: number;
  autoSpawn?: boolean;
  activity?: number;
  interactive?: boolean;
  ariaLabel?: string;
}

export interface LavaBubbleController {
  update(options: Partial<LavaBubbleOptions>): void;
  destroy(): void;
}

export type LavaBubbleProps = LavaBubbleOptions;
