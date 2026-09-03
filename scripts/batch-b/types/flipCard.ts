export interface FlipCardOptions {
  frontTitle?: string;
  frontSubtitle?: string;
  backTitle?: string;
  backSubtitle?: string;
  flipped?: boolean;
  defaultFlipped?: boolean;
  onReveal?: () => void;
  onFlipChange?: (flipped: boolean) => void;
  disabled?: boolean;
}

export interface FlipCardHandle {
  flip(): void;
  reset(): void;
}

export interface FlipCardController {
  update(options: Partial<FlipCardOptions>): void;
  flip(): void;
  reset(): void;
  destroy(): void;
}

export type FlipCardProps = FlipCardOptions;
