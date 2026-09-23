export interface SplitTextOptions {
  text?: string;
  animation?: 'fadeUp' | 'scale' | 'rotate' | 'blur';
  stagger?: number;
  duration?: number;
  loop?: boolean;
  loopPause?: number;
  fontSize?: number;
  color?: string;
}
export interface SplitTextController {
  update(o: Partial<SplitTextOptions>): void;
  destroy(): void;
}
export type SplitTextProps = SplitTextOptions;
