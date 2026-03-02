import { create } from "zustand";
import { Renderer } from "../engines/renderer/Renderer";
import { equationToGLSL, validateEquation } from "../math/equationToGLSL";
import type { VisualProgram } from "@shared/types/VisualProgram";


type Store = {
  program: VisualProgram | null;
  setProgram: (p: VisualProgram) => void;
};

export const useVisualProgramStore = create<Store>((set) => ({
  program: null,

  setProgram: (p) => {
  set({ program: p });

  if (!validateEquation(p.equation.expression)) {
    console.warn("Invalid equation");
    return;
  }

  const glsl = equationToGLSL(p.equation.expression);
  Renderer.updateEquation(glsl);
},
}));
