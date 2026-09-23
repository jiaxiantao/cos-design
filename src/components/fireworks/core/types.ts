export interface FireworksOptions {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 是否自动燃放，默认 true */
  auto?: boolean;
  /**
   * 是否响应点击燃放；默认跟随 auto（auto=false 时不拦截指针）
   */
  interactive?: boolean;
  /** 画布操作提示；非 interactive 时不展示 */
  hint?: string;
  /** 画面空闲（无火箭/粒子）时回调 */
  onComplete?: () => void;
}

export interface FireworksController {
  update(options: Partial<FireworksOptions>): void;
  launch(x?: number): void;
  destroy(): void;
}

export type FireworksProps = FireworksOptions;
export type FireworksHandle = Pick<FireworksController, 'launch'>;
