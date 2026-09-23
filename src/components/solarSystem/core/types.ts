export interface SolarSystemOptions {
  width?: number;
  height?: number;
  speed?: number;
  showOrbits?: boolean;
}

export interface SolarSystemController {
  update(options: Partial<SolarSystemOptions>): void;
  destroy(): void;
}

export type SolarSystemProps = SolarSystemOptions;
