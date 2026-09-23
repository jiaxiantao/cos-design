export interface TypewriterOptions {
  texts?: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
}
export interface TypewriterController {
  update(o: Partial<TypewriterOptions>): void;
  destroy(): void;
}
export type TypewriterProps = TypewriterOptions;
