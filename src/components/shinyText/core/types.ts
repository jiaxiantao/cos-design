export interface ShinyTextOptions {
  text?: string;
  speed?: number;
  color?: string;
  shineColor?: string;
  fontSize?: number;
  disabled?: boolean;
}
export interface ShinyTextController {
  update(o: Partial<ShinyTextOptions>): void;
  destroy(): void;
}
export type ShinyTextProps = ShinyTextOptions;
