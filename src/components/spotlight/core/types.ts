export interface SpotlightOptions {
  radius?: number;
  dimColor?: string;
  slotElement?: HTMLElement;
}
export interface SpotlightController {
  update(o: Partial<SpotlightOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type SpotlightProps = SpotlightOptions;
