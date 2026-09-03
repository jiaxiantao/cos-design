export interface SoapBubblesOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  count?: number;
  speed?: number;
  interactive?: boolean;
  ariaLabel?: string;
}

export interface SoapBubblesController {
  update(options: Partial<SoapBubblesOptions>): void;
  destroy(): void;
}

export type SoapBubblesProps = SoapBubblesOptions;
