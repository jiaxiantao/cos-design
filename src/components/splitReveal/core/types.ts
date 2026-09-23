export interface SplitRevealOptions {
  text?: string;
  delay?: number;
  color?: string;
}
export interface SplitRevealController {
  update(o: Partial<SplitRevealOptions>): void;
  destroy(): void;
}
export type SplitRevealProps = SplitRevealOptions;
