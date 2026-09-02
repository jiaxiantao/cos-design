export interface RotatingTextOptions {
  texts?: string[];
  interval?: number;
  stagger?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  highlightColor?: string;
}
export interface RotatingTextController {
  update(o: Partial<RotatingTextOptions>): void;
  destroy(): void;
}
export type RotatingTextProps = RotatingTextOptions;
