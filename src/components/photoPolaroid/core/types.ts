import type { PhotoPolaroidItem, PhotoPolaroidProps } from '../types';

export type { PhotoPolaroidItem, PhotoPolaroidProps };
export type PhotoPolaroidOptions = PhotoPolaroidProps;

export interface PhotoPolaroidController {
  update(options: Partial<PhotoPolaroidOptions>): void;
  destroy(): void;
}
