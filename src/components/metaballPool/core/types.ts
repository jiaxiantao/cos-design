export interface MetaballPoolOptions {
  width?: number;
  height?: number;
  ballCount?: number;
  color?: string;
}

export interface MetaballPoolController {
  update(options: Partial<MetaballPoolOptions>): void;
  destroy(): void;
}

export type MetaballPoolProps = MetaballPoolOptions;
