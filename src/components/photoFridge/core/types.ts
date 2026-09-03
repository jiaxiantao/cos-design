import type { PhotoFridgeItem, PhotoFridgeProps } from '../types';

export type { PhotoFridgeItem, PhotoFridgeProps };
export type PhotoFridgeOptions = PhotoFridgeProps;

export interface PhotoFridgeController {
  update(options: Partial<PhotoFridgeOptions>): void;
  destroy(): void;
}
