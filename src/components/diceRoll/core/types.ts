export interface DiceRollOptions {
  onRoll?: (value: number) => void;
  sides?: 6;
  rollText?: string;
  rollingText?: string;
  resultPrefix?: string;
}

export interface DiceRollController {
  update(options: Partial<DiceRollOptions>): void;
  destroy(): void;
}

export type DiceRollProps = DiceRollOptions;
