export interface BubbleFieldProps {
  width?: number;
  height?: number;
  /** 为 true 时铺满父容器（父级需有明确高度） */
  fill?: boolean;
  /** 气泡数量上限 */
  bubbleCount?: number;
  /** 上浮速度 */
  speed?: number;
  /** 水体主色 */
  color?: string;
  /** 是否启用鼠标划过扰动 */
  interactive?: boolean;
}

export interface PointerState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  speed: number;
  active: boolean;
  lastTs: number;
}

export interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  /** 目标终端上升速度（向上为正） */
  terminalRise: number;
  drift: number;
  vx: number;
  /** 竖直速度，向上为负（屏幕坐标） */
  vy: number;
  phase: number;
  alpha: number;
  /** 轻微椭圆度（接近 1 = 近球形） */
  aspect: number;
  deformAmp: number;
  deformPhase: number;
  deformSpeed: number;
  tilt: number;
  pulseBoost: number;
  /** 粘性拉伸强度（沿相对流速） */
  streamStretch: number;
  /** 拉伸主轴方向 */
  streamAngle: number;
  /** 二阶表面模态振幅（椭圆振荡） */
  mode2: number;
  mode2Vel: number;
  mode2Angle: number;
  /** 三阶表面模态振幅（非对称抖动） */
  mode3: number;
  mode3Vel: number;
  mode3Phase: number;
  /** 融合后短暂振荡（快速衰减） */
  settle: number;
}

export interface MergePose {
  ax: number;
  ay: number;
  ar: number;
  bx: number;
  by: number;
  br: number;
  approach: number;
  absorb: number;
}

export interface ActiveMerge {
  primaryId: number;
  secondaryId: number;
  progress: number;
  targetRadius: number;
  startPrimaryRadius: number;
  startSecondaryRadius: number;
  startPrimaryX: number;
  startPrimaryY: number;
  startSecondaryX: number;
  startSecondaryY: number;
  pose?: MergePose;
}
