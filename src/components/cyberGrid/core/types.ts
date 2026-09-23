export interface CyberGridOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  color?: string;
  speed?: number;
}

export interface CyberGridController {
  update(options: Partial<CyberGridOptions>): void;
  destroy(): void;
}

export type CyberGridProps = CyberGridOptions;
