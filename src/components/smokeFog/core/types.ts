export interface SmokeFogOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  density?: number;
  color?: string;
  backgroundColor?: string | [string, string, string];
  speed?: number;
  disperseStrength?: number;
  disperseRadius?: number;
  interactive?: boolean;
  ariaLabel?: string;
}

export interface SmokeFogController {
  update(options: Partial<SmokeFogOptions>): void;
  destroy(): void;
}

export type SmokeFogProps = SmokeFogOptions;
