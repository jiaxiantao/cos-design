export interface InkBloomOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  inkColor?: string;
  speed?: number;
  interactive?: boolean;
  ariaLabel?: string;
}

export interface InkBloomController {
  update(options: Partial<InkBloomOptions>): void;
  destroy(): void;
}

export type InkBloomProps = InkBloomOptions;
