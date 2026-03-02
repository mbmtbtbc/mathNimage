export type VisualMode =
  | "equation"
  | "playground"
  | "fractal"
  | "audio-reactive"
  | "generated";

export type VisualProgram = {
  id: string;
  mode: VisualMode;
  equation: {
    expression: string;
    variables: string[];
  };
  parameters: Record<string, number>;
  style: {
    name: string;
  };
};