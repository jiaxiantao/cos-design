export interface SpotlightOptions {
  radius?: number;
  dimColor?: string;
  /** Fallback text when no React/Vue children or slotElement is provided */
  defaultContent?: string;
  slotElement?: HTMLElement;
}
export interface SpotlightController {
  update(o: Partial<SpotlightOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type SpotlightProps = SpotlightOptions;
