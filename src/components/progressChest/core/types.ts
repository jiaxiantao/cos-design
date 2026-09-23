export interface ProgressChestOptions {
  /** 进度 0–100；`auto` 为 true 时由组件自行递增 */
  progress?: number;
  /** 自动灌进度（0→100 循环），适合演示 */
  auto?: boolean;
  onOpen?: () => void;
  label?: string;
  openedLabel?: string;
}

export interface ProgressChestController {
  update(options: Partial<ProgressChestOptions>): void;
  destroy(): void;
}

export type ProgressChestProps = ProgressChestOptions;
