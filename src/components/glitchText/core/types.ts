export interface GlitchTextOptions {
  text?: string;
  color?: string;
  glitchColor1?: string;
  glitchColor2?: string;
  fontSize?: number;
}
export interface GlitchTextController {
  update(o: Partial<GlitchTextOptions>): void;
  destroy(): void;
}
export type GlitchTextProps = GlitchTextOptions;
