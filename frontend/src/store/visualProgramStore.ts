import { create } from "zustand";
import type { VisualProgram } from "@shared/types/VisualProgram";

type Store = {
  program: VisualProgram | null;
  setProgram: (p: VisualProgram) => void;
};

export const useVisualProgramStore = create<Store>((set) => ({
  program: null,
  setProgram: (p) => set({ program: p }),
}));