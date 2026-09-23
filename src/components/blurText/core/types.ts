export interface BlurTextOptions {
  text?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  stagger?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  onAnimationComplete?: () => void;
}
export interface BlurTextController {
  update(options: Partial<BlurTextOptions>): void;
  destroy(): void;
}
export type BlurTextProps = BlurTextOptions;
