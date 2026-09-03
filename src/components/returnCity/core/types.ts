export interface ReturnCityOptions {
  starCount?: number;
  glassCount?: number;
  glassRadius?: number;
}

export interface ReturnCityController {
  update(options: Partial<ReturnCityOptions>): void;
  destroy(): void;
}

export type ReturnCityProps = ReturnCityOptions;
