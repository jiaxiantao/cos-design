export interface CountUpOptions {
  value: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export interface CountUpController {
  update(options: Partial<CountUpOptions>): void;
  destroy(): void;
}

export type CountUpProps = CountUpOptions;
