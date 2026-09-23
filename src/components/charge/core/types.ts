export interface ChargeOptions {
  initQuantity?: number;
  value?: number;
  onChange?: (value: number) => void;
  onComplete?: () => void;
  autoCharge?: boolean;
  interval?: number;
  step?: number;
}
export interface ChargeController {
  update(o: Partial<ChargeOptions>): void;
  destroy(): void;
}
export type ChargeProps = ChargeOptions;
