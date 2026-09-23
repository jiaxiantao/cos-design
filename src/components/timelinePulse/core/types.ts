export interface TimelinePulseOptions {
  steps?: string[];
  current?: number;
  color?: string;
}
export interface TimelinePulseController {
  update(o: Partial<TimelinePulseOptions>): void;
  destroy(): void;
}
export type TimelinePulseProps = TimelinePulseOptions;
