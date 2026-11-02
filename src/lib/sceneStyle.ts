import { SceneType } from "@/engine/types";

export const SCENE_COLORS: Record<SceneType, string> = {
  sky: "#3B82F6",
  fire: "#F97316",
  building: "#64748B",
  text: "#A855F7",
  character: "#22C55E",
  particles: "#EAB308",
};

export const sceneColor = (type: SceneType) => SCENE_COLORS[type] ?? "#6B7280";
