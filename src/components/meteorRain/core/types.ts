export interface MeteorRainOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  meteorCount?: number;
}

export interface MeteorRainController {
  update(options: Partial<MeteorRainOptions>): void;
  destroy(): void;
}

export type MeteorRainProps = MeteorRainOptions;
