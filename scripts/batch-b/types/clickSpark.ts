export interface ClickSparkOptions {
  color?: string;
  count?: number;
  slotElement?: HTMLElement;
}

export interface ClickSparkController {
  update(options: Partial<ClickSparkOptions>): void;
  destroy(): void;
}

export type ClickSparkProps = ClickSparkOptions;
