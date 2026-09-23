export interface SlotMachineOptions {
  /** 符号列表 */
  symbols?: string[];
  /** 单列旋转时长（毫秒），默认 3000；列之间仍有错峰停轮 */
  spinDuration?: number;
  /** 指定下一次停轮结果（长度 3）；不传则随机 */
  targetResults?: string[];
  /** 旋转结束回调 */
  onSpinEnd?: (results: string[]) => void;
  /** 开始按钮文案 */
  startText?: string;
  /** 开始按钮文案别名（与 Turntable.buttonText 对齐） */
  buttonText?: string;
  /** 旋转中的按钮文案 */
  spinningText?: string;
  /** 中奖提示 */
  jackpotText?: string;
  /** 普通结果前缀 */
  resultPrefix?: string;
}

export interface SlotMachineHandle {
  /** 手动旋转；可传入三列结果覆盖 props.targetResults */
  spin: (results?: string[]) => void;
  /** 清除结果文案 */
  reset: () => void;
}

export interface SlotMachineController extends SlotMachineHandle {
  update(options: Partial<SlotMachineOptions>): void;
  destroy(): void;
}

export type SlotMachineProps = SlotMachineOptions;
