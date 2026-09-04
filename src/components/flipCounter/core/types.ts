export interface FlipCounterOptions {
  value?: number;
  digits?: number;
  color?: string;
  duration?: number;
  /** 自动递增演示（默认每 2s），适合 playground */
  auto?: boolean;
  /** auto 递增间隔毫秒，默认 2000 */
  autoInterval?: number;
}

export interface FlipCounterController {
  update(options: Partial<FlipCounterOptions>): void;
  destroy(): void;
}

export type FlipCounterProps = FlipCounterOptions;
