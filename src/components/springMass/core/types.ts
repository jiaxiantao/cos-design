export interface SpringMassOptions {
  width?: number;
  height?: number;
  /** 横向质点数量 */
  cols?: number;
  /** 纵向质点数量 */
  rows?: number;
  /** 弹簧刚度 0~1 */
  stiffness?: number;
  /** 速度阻尼 0~1 */
  damping?: number;
  /** 主色 */
  color?: string;
  /** 操作提示 */
  hint?: string;
}

export interface SpringMassController {
  update(options: Partial<SpringMassOptions>): void;
  destroy(): void;
}

export type SpringMassProps = SpringMassOptions;
