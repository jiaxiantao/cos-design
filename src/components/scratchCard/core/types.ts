export interface ScratchCardOptions {
  /** 涂层颜色 */
  coverColor?: string;
  /** 奖品文字 */
  prize?: string;
  /** 涂层上的提示文案 */
  coverText?: string;
  /** 刮开面积比例阈值（0~1），默认 0.45 */
  revealThreshold?: number;
  /** 刮开完成回调 */
  onReveal?: () => void;
  width?: number;
  height?: number;
}

export interface ScratchCardHandle {
  /** 重置涂层 */
  reset: () => void;
  /** 立即揭开奖品 */
  reveal: () => void;
}

export interface ScratchCardController extends ScratchCardHandle {
  update(options: Partial<ScratchCardOptions>): void;
  destroy(): void;
}

export type ScratchCardProps = ScratchCardOptions;
