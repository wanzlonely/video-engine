import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig, Easing } from "remotion";
import { scenes, subtitles, FPS } from "./data/virga";
import {
  VirgaSkyRain, VirgaTitle, VirgaRainGround, VirgaDryAir,
  VirgaEvaporate, VirgaCloud, VirgaWind, VirgaDesert,
} from "./scenes/VirgaScenes";

const VirgaSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const active = subtitles.find((s) => t >= s.start && t < s.end);
  if (!active) return null;
  const localStart = (t - active.start) * fps;
  const localEnd = (active.end - t) * fps;
  const opacity = Math.min(
    interpolate(localStart, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }),
    interpolate(localEnd, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) })
  );
  const y = interpolate(localStart, [0, 10], [12, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 140, pointerEvents: "none" }}>
      <div style={{
        opacity, transform: `translateY(${y}px)`, maxWidth: "88%", padding: "16px 28px", borderRadius: 16,
        background: "rgba(0,0,0,0.52)", color: "#F2F6FF", fontSize: 33, fontFamily: "system-ui, sans-serif",
        fontWeight: 600, textAlign: "center", lineHeight: 1.4, textShadow: "0 2px 12px rgba(0,0,0,0.55)",
      }}>{active.text}</div>
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{ type: string; gradient: string[]; durationFrames: number }> = ({
  type, gradient, durationFrames,
}) => {
  const localFrame = useCurrentFrame();
  const props = { gradient, localFrame, durationFrames };
  if (type === "title") return <VirgaTitle {...props} />;
  if (type === "rainGround") return <VirgaRainGround {...props} />;
  if (type === "dryAir") return <VirgaDryAir {...props} />;
  if (type === "evaporate") return <VirgaEvaporate {...props} />;
  if (type === "virgaCloud") return <VirgaCloud {...props} />;
  if (type === "wind") return <VirgaWind {...props} />;
  if (type === "desert") return <VirgaDesert {...props} />;
  return <VirgaSkyRain {...props} />;
};

export const VirgaComposition: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#05080f" }}>
    {scenes.map((sc) => {
      const from = Math.round(sc.start * FPS);
      const durationInFrames = Math.round(sc.duration * FPS);
      return (
        <Sequence key={sc.id} from={from} durationInFrames={durationInFrames} name={sc.id} layout="none">
          <SceneRenderer type={sc.type} gradient={[...sc.gradient]} durationFrames={durationInFrames} />
        </Sequence>
      );
    })}
    <VirgaSubtitles />
  </AbsoluteFill>
);
