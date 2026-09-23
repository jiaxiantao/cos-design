export interface ConfettiOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  auto?: boolean;
  interactive?: boolean;
  particleCount?: number;
  hint?: string;
  onComplete?: () => void;
}

export interface ConfettiHandle {
  burst(): void;
}

export interface ConfettiController {
  update(options: Partial<ConfettiOptions>): void;
  burst(): void;
  destroy(): void;
}

export type ConfettiProps = ConfettiOptions;
