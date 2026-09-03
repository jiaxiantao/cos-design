export interface CountdownOptions {
  targetDate: Date | string | number;
  onEnd?: () => void;
  showLabels?: boolean;
  color?: string;
  labels?: Partial<Record<'days' | 'hours' | 'minutes' | 'seconds', string>>;
  invalidText?: string;
  endedText?: string;
}

export interface CountdownController {
  update(options: Partial<CountdownOptions>): void;
  destroy(): void;
}

export type CountdownProps = CountdownOptions;
