export interface AuroraVeilOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  colors?: string[];
  bandCount?: number;
  speed?: number;
  interactive?: boolean;
  ariaLabel?: string;
}

export interface AuroraVeilController {
  update(options: Partial<AuroraVeilOptions>): void;
  destroy(): void;
}

export type AuroraVeilProps = AuroraVeilOptions;
