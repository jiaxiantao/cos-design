export interface NeonTextOptions {
  text?: string;
  color?: string;
  fontSize?: number;
  flicker?: boolean;
}
export interface NeonTextController {
  update(options: Partial<NeonTextOptions>): void;
  destroy(): void;
}
export type NeonTextProps = NeonTextOptions;
