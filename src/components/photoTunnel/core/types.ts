import type { PhotoTunnelItem, PhotoTunnelProps } from '../types';

export type { PhotoTunnelItem, PhotoTunnelProps };
export type PhotoTunnelOptions = PhotoTunnelProps;

export interface PhotoTunnelController {
  update(options: Partial<PhotoTunnelOptions>): void;
  destroy(): void;
}
