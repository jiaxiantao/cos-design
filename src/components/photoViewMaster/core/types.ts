import type { PhotoViewMasterItem, PhotoViewMasterProps } from '../types';

export type { PhotoViewMasterItem, PhotoViewMasterProps };
export type PhotoViewMasterOptions = PhotoViewMasterProps;

export interface PhotoViewMasterController {
  update(options: Partial<PhotoViewMasterOptions>): void;
  destroy(): void;
}
