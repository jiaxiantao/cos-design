export interface OrbitalChartItem {
  label: string;
  value: number;
  color: string;
}

export interface OrbitalChartOptions {
  data?: OrbitalChartItem[];
  size?: number;
}

export interface OrbitalChartController {
  update(options: Partial<OrbitalChartOptions>): void;
  destroy(): void;
}

export type OrbitalChartProps = OrbitalChartOptions;
