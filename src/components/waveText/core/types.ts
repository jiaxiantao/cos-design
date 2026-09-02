export interface WaveTextOptions {
  text?: string;
  amplitude?: number;
  color?: string;
  fontSize?: number;
}
export interface WaveTextController {
  update(o: Partial<WaveTextOptions>): void;
  destroy(): void;
}
export type WaveTextProps = WaveTextOptions;
