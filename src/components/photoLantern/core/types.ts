import type { PhotoLanternItem, PhotoLanternProps } from '../types';

export type { PhotoLanternItem, PhotoLanternProps };
export type PhotoLanternOptions = PhotoLanternProps;

export interface PhotoLanternController {
  update(options: Partial<PhotoLanternOptions>): void;
  destroy(): void;
}
