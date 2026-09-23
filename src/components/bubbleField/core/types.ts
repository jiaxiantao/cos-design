export interface BubbleFieldOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  bubbleCount?: number;
  speed?: number;
  color?: string;
  interactive?: boolean;
}

export interface BubbleFieldController {
  update(options: Partial<BubbleFieldOptions>): void;
  destroy(): void;
}

export type BubbleFieldProps = BubbleFieldOptions;
