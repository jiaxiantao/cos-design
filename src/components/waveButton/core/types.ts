export interface WaveButtonOptions {
  text?: string;
  color?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  buttonProps?: Record<string, unknown>;
}
export interface WaveButtonController {
  update(o: Partial<WaveButtonOptions>): void;
  getButton(): HTMLButtonElement;
  destroy(): void;
}
export type WaveButtonProps = WaveButtonOptions;
