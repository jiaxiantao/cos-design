import type { PhotoAlbumItem, PhotoAlbumLabels, PhotoAlbumProps } from '../types';

export type { PhotoAlbumItem, PhotoAlbumLabels, PhotoAlbumProps };
export type PhotoAlbumOptions = PhotoAlbumProps;

export interface PhotoAlbumController {
  update(options: Partial<PhotoAlbumOptions>): void;
  destroy(): void;
}
