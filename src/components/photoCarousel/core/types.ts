import type { PhotoCarouselItem, PhotoCarouselProps } from '../types';

export type { PhotoCarouselItem, PhotoCarouselProps };
export type PhotoCarouselOptions = PhotoCarouselProps;

export interface PhotoCarouselController {
  update(options: Partial<PhotoCarouselOptions>): void;
  destroy(): void;
}
