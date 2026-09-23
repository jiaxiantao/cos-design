export interface ElectricArcOptions {
  width?: number;
  height?: number;
  color?: string;
}

export interface ElectricArcController {
  update(options: Partial<ElectricArcOptions>): void;
  destroy(): void;
}

export type ElectricArcProps = ElectricArcOptions;
