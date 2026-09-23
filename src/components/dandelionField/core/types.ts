export interface DandelionFieldOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  plantCount?: number;
  seedCount?: number;
  speed?: number;
  interactive?: boolean;
  ariaLabel?: string;
}

export interface DandelionFieldController {
  update(options: Partial<DandelionFieldOptions>): void;
  destroy(): void;
}

export type DandelionFieldProps = DandelionFieldOptions;
