export interface NineGridItem {
  /** 奖品文案 */
  label: string;
  /** 可选图标（emoji 等），显示在文案上方 */
  icon?: string;
}

export interface NineGridHandle {
  /** 开始抽奖；可传入目标索引覆盖 props.targetIndex */
  draw: (targetIndex?: number) => void;
  /** 重置高亮与中奖态 */
  reset: () => void;
}

export interface NineGridOptions {
  /** 9 个奖品格子（不足补齐、超出截断） */
  items?: NineGridItem[];
  /** 指定下一次抽中的索引 0–8（服务端开奖）；不传则随机 */
  targetIndex?: number;
  /** 抽奖按钮文案 */
  buttonText?: string;
  /** 抽奖进行中的按钮文案 */
  spinningText?: string;
  /** 抽奖结束回调 */
  onDrawEnd?: (item: NineGridItem, index: number) => void;
  /** 禁用交互 */
  disabled?: boolean;
}

export interface NineGridController extends NineGridHandle {
  update(options: Partial<NineGridOptions>): void;
  destroy(): void;
}

export type NineGridProps = NineGridOptions;
