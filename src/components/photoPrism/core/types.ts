import type { PhotoPrismItem, PhotoPrismProps } from '../types';

export type { PhotoPrismItem, PhotoPrismProps };
export type PhotoPrismOptions = PhotoPrismProps;

export interface PhotoPrismController {
  update(options: Partial<PhotoPrismOptions>): void;
  destroy(): void;
}
