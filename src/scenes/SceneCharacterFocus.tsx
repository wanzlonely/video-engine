import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../engine/types";
import { BackgroundLayer } from "../engine/BackgroundLayer";
import { CharacterLayer } from "../engine/CharacterLayer";

interface SceneCharacterFocusProps {
  scene: Scene;
}

/**
 * Scene type "character": a close-up shot built around a human figure
 * rather than a background set piece.
 *
 * IMPORTANT — asset requirement: `scene.characters[].asset` must point to
 * a photoreal or realistically-rendered human character (photo, 3D render,
 * or illustrated-but-human figure). This scene type does not accept
 * stickman/vector-stick-figure assets — that was an explicit constraint
 * from an earlier project and carries over here. The component itself
 * can't validate the image content, so enforce this at asset-sourcing
 * time, not in code.
 *
 * Layout: softly lit backdrop (keeps focus on the character) + a subtle
 * vignette + the character centered via CharacterLayer, which already
 * handles entrance spring and idle float.
 */
export const SceneCharacterFocus: React.FC<SceneCharacterFocusProps> = ({
  scene,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gradient =
    (scene.background?.gradient as [string, string]) || ["#2A2420", "#0C0A09"];

  const backdropFade = spring({
    frame,
    fps,
    config: { damping: 20, mass: 0.8, stiffness: 90 },
  });

  const vignetteOpacity = interpolate(backdropFade, [0, 1], [0, 0.55]);

  return (
    <AbsoluteFill>
      <BackgroundLayer gradient={gradient} seed={`${scene.id}-char-bg`} />

      {/* soft radial vignette to pull focus toward the character */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%)",
          opacity: vignetteOpacity,
        }}
      />

      {scene.characters?.map((character) => (
        <CharacterLayer key={character.id} character={character} />
      ))}

      {scene.text ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: `${scene.text.y}%`,
          }}
        >
          <div
            style={{
              fontFamily: "Montserrat, Arial, sans-serif",
              fontWeight: 700,
              fontSize: scene.text.size,
              color: scene.text.color,
              textAlign: "center",
              textShadow: "0 4px 14px rgba(0,0,0,0.7)",
              maxWidth: "85%",
            }}
          >
            {scene.text.content}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
