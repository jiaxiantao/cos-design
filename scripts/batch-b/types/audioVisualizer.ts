export interface AudioVisualizerOptions {
  width?: number;
  height?: number;
  barCount?: number;
  useMic?: boolean;
}

export interface AudioVisualizerController {
  update(options: Partial<AudioVisualizerOptions>): void;
  destroy(): void;
}

export type AudioVisualizerProps = AudioVisualizerOptions;
