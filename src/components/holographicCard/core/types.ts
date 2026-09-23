export interface HolographicCardOptions {
  title?: string;
  subtitle?: string;
  image?: string;
}
export interface HolographicCardController {
  update(o: Partial<HolographicCardOptions>): void;
  destroy(): void;
}
export type HolographicCardProps = HolographicCardOptions;
