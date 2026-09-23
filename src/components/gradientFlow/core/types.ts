export interface GradientFlowOptions {
  text?: string;
  colors?: string[];
  fontSize?: number;
}
export interface GradientFlowController {
  update(o: Partial<GradientFlowOptions>): void;
  destroy(): void;
}
export type GradientFlowProps = GradientFlowOptions;
