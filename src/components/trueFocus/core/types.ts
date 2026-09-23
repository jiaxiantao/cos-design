export interface TrueFocusOptions {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  fontSize?: number;
  color?: string;
}
export interface TrueFocusController {
  update(o: Partial<TrueFocusOptions>): void;
  destroy(): void;
}
export type TrueFocusProps = TrueFocusOptions;
