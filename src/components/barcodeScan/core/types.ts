export interface BarcodeScanOptions {
  scanColor?: string;
  speed?: number;
  slotElement?: HTMLElement;
  defaultContent?: string;
}
export interface BarcodeScanController {
  update(o: Partial<BarcodeScanOptions>): void;
  getSlot(): HTMLElement;
  destroy(): void;
}
export type BarcodeScanProps = BarcodeScanOptions;
