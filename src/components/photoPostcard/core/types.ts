import type { PhotoPostcardItem, PhotoPostcardProps } from '../types';

export type { PhotoPostcardItem, PhotoPostcardProps };
export type PhotoPostcardOptions = PhotoPostcardProps;

export interface PhotoPostcardController {
  update(options: Partial<PhotoPostcardOptions>): void;
  destroy(): void;
}
