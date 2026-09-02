export interface LiquidGlassOptions {
  blur?: number;
  borderRadius?: number;
  slotElement?: HTMLElement;
  defaultContent?: string;
}
export interface LiquidGlassController {
  update(o: Partial<LiquidGlassOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type LiquidGlassProps = LiquidGlassOptions;
