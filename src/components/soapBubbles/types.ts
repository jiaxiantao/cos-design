export interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  wobble: number;
  seed: number;
  depth: number;
  pop: number;
  /** 刺破点方位角 */
  popAng: number;
  /** 基础上浮速度（正值，实际向上为负） */
  rise: number;
  /** 当前速度倍率（忽快忽慢） */
  gust: number;
  /** 距下次换阵风 */
  gustT: number;
  /** 横向目标漂移 */
  drift: number;
  /** 距下次改横向意图 */
  swayT: number;
  /** 碰撞冷却，避免连环触发 */
  coolT: number;
}

export interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  kind: 0 | 1;
}

export const MAX_BUBBLE_R = 72;
export const MAX_DPR = 2;
export const TWO_PI = Math.PI * 2;
