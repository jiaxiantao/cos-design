export interface DoublePendulumOptions {
  width?: number;
  height?: number;
  trailLength?: number;
  color?: string;
  color2?: string;
}

export interface DoublePendulumController {
  update(options: Partial<DoublePendulumOptions>): void;
  destroy(): void;
}

export type DoublePendulumProps = DoublePendulumOptions;
