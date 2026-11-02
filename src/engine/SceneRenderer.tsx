import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { SceneMapEntry } from "./types";
import { SceneSky } from "../scenes/SceneSky";
import { SceneFire } from "../scenes/SceneFire";
import { SceneBuilding } from "../scenes/SceneBuilding";
import { SceneText } from "../scenes/SceneText";
import { SceneCharacterFocus } from "../scenes/SceneCharacterFocus";
import { CharacterLayer } from "./CharacterLayer";
import { TransitionLayer } from "./TransitionLayer";

interface SceneRendererProps {
  entry: SceneMapEntry;
}

const sceneComponents: Record<
  string,
  React.ComponentType<{ scene: SceneMapEntry["scene"] }>
> = {
  sky: SceneSky,
  fire: SceneFire,
  building: SceneBuilding,
  text: SceneText,
  character: SceneCharacterFocus,
};

const SceneContent: React.FC<{ entry: SceneMapEntry }> = ({ entry }) => {
  const frame = useCurrentFrame();
  const { scene, transitionInFrames } = entry;
  const Component = sceneComponents[scene.type];

  return (
    <TransitionLayer
      type={scene.transitionIn?.type ?? "none"}
      localFrame={frame}
      transitionFrames={transitionInFrames}
    >
      <AbsoluteFill>
        {Component ? <Component scene={scene} /> : null}
        {/* "character" scenes render their own characters inside SceneCharacterFocus;
            every other scene type gets characters overlaid here as a generic layer. */}
        {scene.type !== "character" &&
          scene.characters?.map((character) => (
            <CharacterLayer key={character.id} character={character} />
          ))}
      </AbsoluteFill>
    </TransitionLayer>
  );
};

/**
 * Renders a single scene's Sequence. The Sequence starts `transitionInFrames`
 * early (overlapping the previous scene) so the entrance transition has
 * something to animate over; TransitionLayer handles the actual visual blend.
 *
 * Note: because the Sequence is extended backwards, the scene's own internal
 * animations (parallax, idle motion, etc., each reading useCurrentFrame())
 * also start counting from this earlier point — in practice a few frames
 * of head-start that's visually unnoticeable, but worth knowing if a scene
 * ever needs frame-accurate sync with something outside itself (e.g. audio
 * cue points).
 */
export const SceneRenderer: React.FC<SceneRendererProps> = ({ entry }) => {
  const { scene, startFrame, durationFrames, transitionInFrames } = entry;
  const from = Math.max(0, startFrame - transitionInFrames);
  const extendedDuration = durationFrames + transitionInFrames;

  return (
    <Sequence from={from} durationInFrames={extendedDuration} name={scene.id}>
      <SceneContent entry={entry} />
    </Sequence>
  );
};
