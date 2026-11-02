import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { subtitles } from "../data/zanzibar";

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = subtitles.find((s) => t >= s.start && t < s.end);
  if (!active) return null;

  const localStart = (t - active.start) * fps;
  const localEnd = (active.end - t) * fps;
  const opacity = Math.min(
    interpolate(localStart, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(localEnd, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 140,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: "86%",
          padding: "14px 28px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          fontSize: 34,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.35,
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
