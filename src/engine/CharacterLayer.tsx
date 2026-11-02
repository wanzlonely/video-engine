import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SceneCharacter } from "./types";

interface CharacterLayerProps {
  character: SceneCharacter;
}

export const CharacterLayer: React.FC<CharacterLayerProps> = ({
  character,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 18,
      mass: 0.6,
      stiffness: 120,
    },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const idleFloat = Math.sin(frame / 18) * 4;

  const translateY = interpolate(entrance, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${character.x}%`,
          top: `${character.y}%`,
          transform: `translate(-50%, -50%) translateY(${
            translateY + idleFloat
          }px) scale(${character.scale})`,
          opacity,
        }}
      >
        <Img
          src={character.asset}
          style={{
            display: "block",
            maxWidth: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
