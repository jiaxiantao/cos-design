import type { PhotoLightboxItem, PhotoLightboxProps } from '../types';

export type { PhotoLightboxItem, PhotoLightboxProps };
export type PhotoLightboxOptions = PhotoLightboxProps;

export interface PhotoLightboxController {
  update(options: Partial<PhotoLightboxOptions>): void;
  destroy(): void;
}
