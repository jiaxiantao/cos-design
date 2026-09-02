export interface BurnAwayOptions {
  text?: string;
  fontSize?: number;
  onComplete?: () => void;
  completedText?: string;
}
export interface BurnAwayController {
  update(o: Partial<BurnAwayOptions>): void;
  ignite(): void;
  destroy(): void;
}
export type BurnAwayProps = BurnAwayOptions;
export type BurnAwayHandle = Pick<BurnAwayController, 'ignite'>;
