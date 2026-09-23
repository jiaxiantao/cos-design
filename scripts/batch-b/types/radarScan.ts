export interface RadarScanOptions {
  size?: number;
  color?: string;
  blipCount?: number;
}

export interface RadarScanController {
  update(options: Partial<RadarScanOptions>): void;
  destroy(): void;
}

export type RadarScanProps = RadarScanOptions;
