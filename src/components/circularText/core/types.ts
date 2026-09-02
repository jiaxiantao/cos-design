export interface CircularTextOptions {
  text?: string;
  spinDuration?: number;
  onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
  fontSize?: number;
  radius?: number;
  color?: string;
}
export interface CircularTextController {
  update(o: Partial<CircularTextOptions>): void;
  destroy(): void;
}
export type CircularTextProps = CircularTextOptions;
