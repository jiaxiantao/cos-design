export interface CurvedLoopOptions {
  text?: string;
  speed?: number;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
  color?: string;
  fontSize?: number;
}
export interface CurvedLoopController {
  update(o: Partial<CurvedLoopOptions>): void;
  destroy(): void;
}
export type CurvedLoopProps = CurvedLoopOptions;
