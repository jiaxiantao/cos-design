export interface AuroraOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  colors?: string[];
}

export interface AuroraController {
  update(options: Partial<AuroraOptions>): void;
  destroy(): void;
}

export type AuroraProps = AuroraOptions;
