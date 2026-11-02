import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { scenes, subtitles, FPS } from "./data/virga";
import {
  VirgaSkyRain,
  VirgaTitle,
  VirgaRainGround,
  VirgaDryAir,
  VirgaEvaporate,
  VirgaCloud,
  VirgaWind,
  VirgaDesert,
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
    interpolate(localStart, [0, 5], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(localEnd, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 140, pointerEvents: "none" }}>
      <div style={{ opacity, maxWidth: "88%", padding: "14px 26px", borderRadius: 14, background: "rgba(0,0,0,0.55)", color: "#F0F4FF", fontSize: 32, fontFamily: "system-ui, sans-serif", fontWeight: 600, textAlign: "center", lineHeight: 1.4, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
        {active.text}
      </div>
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{ type: string; gradient: string[]; durationFrames: number }> = ({
  type, gradient, durationFrames,
}) => {
  const localFrame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(localFrame, [durationFrames - 8, durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const props = { gradient, localFrame, durationFrames };
  let content: React.ReactNode = <VirgaSkyRain {...props} />;
  if (type === "title") content = <VirgaTitle {...props} />;
  else if (type === "rainGround") content = <VirgaRainGround {...props} />;
  else if (type === "dryAir") content = <VirgaDryAir {...props} />;
  else if (type === "evaporate") content = <VirgaEvaporate {...props} />;
  else if (type === "virgaCloud") content = <VirgaCloud {...props} />;
  else if (type === "wind") content = <VirgaWind {...props} />;
  else if (type === "desert") content = <VirgaDesert {...props} />;
  else if (type === "skyRain") content = <VirgaSkyRain {...props} />;
  return <AbsoluteFill style={{ opacity }}>{content}</AbsoluteFill>;
};

export const VirgaComposition: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {scenes.map((sc) => {
      const from = Math.round(sc.start * FPS);
      const durationInFrames = Math.round(sc.duration * FPS);
      return (
        <Sequence key={sc.id} from={from} durationInFrames={durationInFrames} name={sc.id}>
          <SceneRenderer type={sc.type} gradient={[...sc.gradient]} durationFrames={durationInFrames} />
        </Sequence>
      );
    })}
    <VirgaSubtitles />
  </AbsoluteFill>
);
