import type { PhotoScrollItem, PhotoScrollProps } from '../types';

export type { PhotoScrollItem, PhotoScrollProps };
export type PhotoScrollOptions = PhotoScrollProps;

export interface PhotoScrollController {
  update(options: Partial<PhotoScrollOptions>): void;
  destroy(): void;
}
