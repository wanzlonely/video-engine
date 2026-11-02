import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SubtitleWord } from "./types";

interface SubtitleLayerProps {
  subtitles: SubtitleWord[];
  fps: number;
}

const WINDOW_SECONDS = 3.2;
const MAX_WORDS_VISIBLE = 6;

export const SubtitleLayer: React.FC<SubtitleLayerProps> = ({
  subtitles,
  fps,
}) => {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();
  const currentTime = frame / videoFps;

  const activeWords = subtitles.filter(
    (word) =>
      word.start <= currentTime + WINDOW_SECONDS &&
      word.end >= currentTime - 0.4
  );

  const visibleWords = activeWords.slice(-MAX_WORDS_VISIBLE);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "12%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 14px",
          maxWidth: "80%",
        }}
      >
        {visibleWords.map((word, index) => {
          const startFrame = Math.round(word.start * videoFps);
          const localFrame = frame - startFrame;

          const scaleSpring = spring({
            frame: localFrame,
            fps,
            config: {
              damping: 14,
              mass: 0.4,
              stiffness: 200,
            },
          });

          const isActive =
            currentTime >= word.start && currentTime <= word.end;

          const opacity = interpolate(localFrame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const scale = interpolate(scaleSpring, [0, 1], [0.7, 1]);

          return (
            <span
              key={`${word.text}-${word.start}-${index}`}
              style={{
                fontFamily: "Montserrat, Arial, sans-serif",
                fontWeight: 800,
                fontSize: 64,
                color: isActive ? "#FFD60A" : "#FFFFFF",
                textShadow:
                  "0 4px 12px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.9)",
                transform: `scale(${scale})`,
                opacity,
                transition: "color 0.1s linear",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
