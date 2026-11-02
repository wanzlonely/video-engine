import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Scene } from "../engine/types";
import { BackgroundLayer } from "../engine/BackgroundLayer";

interface SceneSkyProps {
  scene: Scene;
}

export const SceneSky: React.FC<SceneSkyProps> = ({ scene }) => {
  const frame = useCurrentFrame();

  const gradient = scene.background?.gradient || ["#1B2735", "#090A0F"];
  const color = scene.background?.color;

  const parallaxY = interpolate(frame, [0, 300], [0, -20], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BackgroundLayer
        gradient={gradient as [string, string]}
        color={color}
        stars
        particles
        seed={scene.id}
      />
      <AbsoluteFill
        style={{
          transform: `translateY(${parallaxY}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            width: "100%",
            height: "40%",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
