export interface FuzzyTextOptions {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  baseIntensity?: number;
  hoverIntensity?: number;
  enableHover?: boolean;
  fuzzRange?: number;
}
export interface FuzzyTextController {
  update(o: Partial<FuzzyTextOptions>): void;
  destroy(): void;
}
export type FuzzyTextProps = FuzzyTextOptions;
