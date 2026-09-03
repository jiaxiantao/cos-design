export interface RopeChainOptions {
  width?: number;
  height?: number;
  segments?: number;
  color?: string;
  gravity?: number;
}

export interface RopeChainController {
  update(options: Partial<RopeChainOptions>): void;
  destroy(): void;
}

export type RopeChainProps = RopeChainOptions;
