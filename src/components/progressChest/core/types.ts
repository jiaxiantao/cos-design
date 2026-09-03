export interface ProgressChestOptions {
  progress?: number;
  onOpen?: () => void;
  label?: string;
  openedLabel?: string;
}

export interface ProgressChestController {
  update(options: Partial<ProgressChestOptions>): void;
  destroy(): void;
}

export type ProgressChestProps = ProgressChestOptions;
