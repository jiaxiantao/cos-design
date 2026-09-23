export interface ClickSparkOptions {
  color?: string;
  count?: number;
  /** Fallback label when no slotted children (Vue / Core / Element demos). */
  defaultContent?: string;
  slotElement?: HTMLElement;
}

export interface ClickSparkController {
  getSlot(): HTMLElement;
  update(options: Partial<ClickSparkOptions>): void;
  destroy(): void;
}

export type ClickSparkProps = ClickSparkOptions;
