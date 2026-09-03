export interface SnowfallOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  mode?: 'snow' | 'sakura';
  count?: number;
}

export interface SnowfallController {
  update(options: Partial<SnowfallOptions>): void;
  destroy(): void;
}

export type SnowfallProps = SnowfallOptions;
