export interface ParticleNetworkOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  particleCount?: number;
  linkDistance?: number;
  repelRadius?: number;
  color?: string;
  hint?: string;
}

export interface ParticleNetworkController {
  update(options: Partial<ParticleNetworkOptions>): void;
  destroy(): void;
}

export type ParticleNetworkProps = ParticleNetworkOptions;
