import { create } from "zustand";
import { Naskah, Scene } from "@/engine/types";

export type RenderStatus = "idle" | "queued" | "processing" | "done" | "error";

interface RenderJob {
  jobId: string;
  status: RenderStatus;
  progress?: number;
  outputUrl?: string;
  error?: string;
}

interface NaskahStore {
  naskah: Naskah | null;
  selectedSceneId: string | null;
  job: RenderJob | null;

  setNaskah: (naskah: Naskah) => void;
  updateMeta: (patch: Partial<Naskah["meta"]>) => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  addScene: (scene: Scene) => void;
  removeScene: (id: string) => void;
  selectScene: (id: string | null) => void;

  setJob: (job: RenderJob | null) => void;
}

export const useNaskahStore = create<NaskahStore>((set) => ({
  naskah: null,
  selectedSceneId: null,
  job: null,

  setNaskah: (naskah) => set({ naskah, selectedSceneId: null, job: null }),

  updateMeta: (patch) =>
    set((state) =>
      state.naskah
        ? { naskah: { ...state.naskah, meta: { ...state.naskah.meta, ...patch } } }
        : state
    ),

  updateScene: (id, patch) =>
    set((state) => {
      if (!state.naskah) return state;
      return {
        naskah: {
          ...state.naskah,
          scenes: state.naskah.scenes.map((s) =>
            s.id === id ? { ...s, ...patch } : s
          ),
        },
      };
    }),

  addScene: (scene) =>
    set((state) =>
      state.naskah
        ? { naskah: { ...state.naskah, scenes: [...state.naskah.scenes, scene] } }
        : state
    ),

  removeScene: (id) =>
    set((state) =>
      state.naskah
        ? {
            naskah: {
              ...state.naskah,
              scenes: state.naskah.scenes.filter((s) => s.id !== id),
            },
            selectedSceneId:
              state.selectedSceneId === id ? null : state.selectedSceneId,
          }
        : state
    ),

  selectScene: (id) => set({ selectedSceneId: id }),

  setJob: (job) => set({ job }),
}));
