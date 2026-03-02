import { create } from "zustand";
import { Renderer } from "../engines/renderer/Renderer";
import { equationToGLSL, validateEquation } from "../math/equationToGLSL";
import type { VisualProgram } from "@shared/types/VisualProgram";
import { extractParameters } from "../math/extractParameters";


type Store = {
  program: VisualProgram | null;
  setProgram: (p: VisualProgram) => void;
};

export const useVisualProgramStore = create<Store>((set) => ({
  program: null,

  setProgram: (p) => {
  const paramsList = extractParameters(
  p.equation.expression
);

// keep existing values if present
const parameters: Record<string, number> = {
  ...(p.parameters || {}),
};

paramsList.forEach((name) => {
  if (!(name in parameters)) {
    parameters[name] = 1.0;
  }
});

p.parameters = parameters;

  set({ program: p });

  if (!validateEquation(p.equation.expression)) return;

  const glsl = equationToGLSL(
    p.equation.expression,
    parameters
  );

  Renderer.updateEquation(glsl, p.parameters);
  Renderer.updateParameters(p.parameters);
},
}));
