import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Scene } from "../engine/types";
import { BackgroundLayer } from "../engine/BackgroundLayer";

interface SceneTextProps {
  scene: Scene;
}

export const SceneText: React.FC<SceneTextProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text = scene.text;
  const words = useMemo(
    () => (text ? text.content.split(" ") : []),
    [text]
  );

  const showBackground = !!scene.background;

  const cardScale = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.5, stiffness: 140 },
  });

  const cardOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!text) {
    return <AbsoluteFill />;
  }

  return (
    <AbsoluteFill>
      {showBackground && (
        <BackgroundLayer
          gradient={
            (scene.background?.gradient as [string, string]) ||
            ["#141C2E", "#0A0E1A"]
          }
          color={scene.background?.color}
          stars
          seed={scene.id}
        />
      )}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 10%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.3em 0.45em",
            transform: `scale(${interpolate(cardScale, [0, 1], [0.85, 1])})`,
            opacity: cardOpacity,
            position: "absolute",
            left: `${text.x}%`,
            top: `${text.y}%`,
          }}
        >
          {words.map((word, i) => {
            const wordDelay = i * 2.5;
            const localFrame = frame - wordDelay;

            const wordSpring = spring({
              frame: localFrame,
              fps,
              config: { damping: 15, mass: 0.4, stiffness: 180 },
            });

            const opacity = interpolate(localFrame, [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const translateY = interpolate(wordSpring, [0, 1], [24, 0]);
            const blur = interpolate(localFrame, [0, 8], [6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <span
                key={`${word}-${i}`}
                style={{
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 800,
                  fontSize: text.size,
                  color: text.color,
                  opacity,
                  display: "inline-block",
                  transform: `translateY(${translateY}px)`,
                  filter: `blur(${blur}px)`,
                  textShadow:
                    "0 6px 20px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.8)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
