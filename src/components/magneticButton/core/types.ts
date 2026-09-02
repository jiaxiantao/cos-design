export interface MagneticButtonOptions {
  strength?: number;
  color?: string;
  slotElement?: HTMLElement;
  defaultContent?: string;
}
export interface MagneticButtonController {
  update(o: Partial<MagneticButtonOptions>): void;
  getSlot(): HTMLButtonElement;
  destroy(): void;
}
export type MagneticButtonProps = MagneticButtonOptions;
