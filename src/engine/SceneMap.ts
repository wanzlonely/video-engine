import { Scene, SceneMapEntry } from "./types";

/**
 * Builds a resolved timeline ("SceneMap") from the raw scene list.
 * Converts each scene's start/duration (in seconds) into frame bounds,
 * and resolves how many frames of overlap its transitionIn consumes.
 *
 * This is the single source of truth both the renderer and any future
 * editor UI (timeline view, drag-to-reorder, scrubber) should read from,
 * so frame-math never has to be duplicated.
 */
export const buildSceneMap = (scenes: Scene[], fps: number): SceneMapEntry[] => {
  const sorted = [...scenes].sort((a, b) => a.start - b.start);

  return sorted.map((scene, index) => {
    const startFrame = Math.round(scene.start * fps);
    const durationFrames = Math.round(scene.duration * fps);
    const transitionInFrames = scene.transitionIn
      ? Math.round(scene.transitionIn.duration * fps)
      : 0;

    return {
      scene,
      index,
      startFrame,
      durationFrames,
      endFrame: startFrame + durationFrames,
      transitionInFrames,
    };
  });
};

/** Total timeline length in frames, across all scenes. */
export const getTimelineDurationFrames = (map: SceneMapEntry[]): number =>
  map.reduce((max, entry) => Math.max(max, entry.endFrame), 0);

/** Finds the scene (and its map entry) active at a given frame, if any. */
export const getSceneAtFrame = (
  map: SceneMapEntry[],
  frame: number
): SceneMapEntry | undefined =>
  map.find((entry) => frame >= entry.startFrame && frame < entry.endFrame);
