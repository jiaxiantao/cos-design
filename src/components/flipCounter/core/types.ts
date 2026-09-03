export interface FlipCounterOptions {
  value?: number;
  digits?: number;
  color?: string;
  duration?: number;
}

export interface FlipCounterController {
  update(options: Partial<FlipCounterOptions>): void;
  destroy(): void;
}

export type FlipCounterProps = FlipCounterOptions;
