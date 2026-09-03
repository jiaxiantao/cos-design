import type { PhotoClotheslineItem, PhotoClotheslineProps } from '../types';

export type { PhotoClotheslineItem, PhotoClotheslineProps };
export type PhotoClotheslineOptions = PhotoClotheslineProps;

export interface PhotoClotheslineController {
  update(options: Partial<PhotoClotheslineOptions>): void;
  destroy(): void;
}
