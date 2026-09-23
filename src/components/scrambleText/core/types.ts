export interface ScrambleTextOptions {
  text?: string;
  duration?: number;
  charset?: string;
}
export interface ScrambleTextController {
  update(o: Partial<ScrambleTextOptions>): void;
  destroy(): void;
}
export type ScrambleTextProps = ScrambleTextOptions;
