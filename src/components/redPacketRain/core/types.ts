export interface RedPacketRainOptions {
  width?: number;
  height?: number;
  fill?: boolean;
  duration?: number;
  auto?: boolean;
  onGrab?: (amount: number) => void;
  onEnd?: () => void;
  grabbedLabel?: string;
  endedText?: string;
  hint?: string;
}

export interface RedPacketRainHandle {
  start(): void;
  stop(): void;
  reset(): void;
}

export interface RedPacketRainController {
  update(options: Partial<RedPacketRainOptions>): void;
  start(): void;
  stop(): void;
  reset(): void;
  destroy(): void;
}

export type RedPacketRainProps = RedPacketRainOptions;
