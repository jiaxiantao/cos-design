export interface PlasmaBallOptions {
  width?: number;
  height?: number;
  color?: string;
  arcCount?: number;
}

export interface PlasmaBallController {
  update(options: Partial<PlasmaBallOptions>): void;
  destroy(): void;
}

export type PlasmaBallProps = PlasmaBallOptions;
