export interface StarfieldOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  starCount?: number;
  speed?: number;
}

export interface StarfieldController {
  update(options: Partial<StarfieldOptions>): void;
  destroy(): void;
}

export type StarfieldProps = StarfieldOptions;
