export interface RippleWaterOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  fromColor?: string;
  toColor?: string;
  color?: string;
  waveAmplitude?: number;
  waveSpeed?: number;
  shimmer?: number;
  reflection?: number;
  rippleStrength?: number;
  rippleRadius?: number;
  damping?: number;
  spread?: number;
  interactive?: boolean;
  showHint?: boolean;
  hint?: string;
}

export interface RippleWaterController {
  update(options: Partial<RippleWaterOptions>): void;
  destroy(): void;
}

export type RippleWaterProps = RippleWaterOptions;
