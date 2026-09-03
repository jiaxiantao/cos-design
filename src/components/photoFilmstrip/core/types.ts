import type { PhotoFilmstripItem, PhotoFilmstripProps } from '../types';

export type { PhotoFilmstripItem, PhotoFilmstripProps };
export type PhotoFilmstripOptions = PhotoFilmstripProps;

export interface PhotoFilmstripController {
  update(options: Partial<PhotoFilmstripOptions>): void;
  destroy(): void;
}
