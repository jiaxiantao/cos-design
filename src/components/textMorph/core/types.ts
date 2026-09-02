export interface TextMorphOptions {
  texts?: string[];
  interval?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
}
export interface TextMorphController {
  update(o: Partial<TextMorphOptions>): void;
  destroy(): void;
}
export type TextMorphProps = TextMorphOptions;
