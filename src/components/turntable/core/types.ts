export interface TurntablePrize {
  label: string;
  color?: string;
}

export interface TurntableOptions {
  /** 奖品列表 */
  prizes?: TurntablePrize[];
  /** 转盘直径，默认 360 */
  size?: number;
  /** 旋转动画时长（毫秒），默认 4000 */
  spinDuration?: number;
  /** 旋转圈数，默认 5 */
  spinRounds?: number;
  /** 指定下一次抽中的奖品索引（服务端开奖）；不传则随机 */
  targetIndex?: number;
  /** 抽奖按钮文案 */
  buttonText?: string;
  /** 抽奖进行中的按钮文案 */
  spinningText?: string;
  /** 中奖结果前缀 */
  resultPrefix?: string;
  /** 旋转结束回调 */
  onSpinEnd?: (prize: TurntablePrize, index: number) => void;
}

export interface TurntableHandle {
  /** 手动抽奖；可传入目标索引覆盖 props.targetIndex */
  spin: (targetIndex?: number) => void;
  /** 清除结果文案并允许再次抽奖 */
  reset: () => void;
}

export interface TurntableController extends TurntableHandle {
  update(options: Partial<TurntableOptions>): void;
  destroy(): void;
}

export type TurntableProps = TurntableOptions;
