export interface NetworkGraphNode {
  id: string;
  label?: string;
  color?: string;
}

export interface NetworkGraphEdge {
  source: string;
  target: string;
}

export interface NetworkGraphOptions {
  width?: number;
  height?: number;
  nodes?: NetworkGraphNode[];
  edges?: NetworkGraphEdge[];
  linkColor?: string;
  nodeRadius?: number;
  hint?: string;
}

export interface NetworkGraphController {
  update(options: Partial<NetworkGraphOptions>): void;
  destroy(): void;
}

export type NetworkGraphProps = NetworkGraphOptions;
