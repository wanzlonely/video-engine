import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { scenes, FPS } from "./data/virga";
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

const SceneRenderer: React.FC<{
  type: string;
  gradient: string[];
  durationFrames: number;
}> = ({ type, gradient, durationFrames }) => {
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
        <Sequence
          key={sc.id}
          from={from}
          durationInFrames={durationInFrames}
          name={sc.id}
          layout="none"
        >
          <SceneRenderer
            type={sc.type}
            gradient={[...sc.gradient]}
            durationFrames={durationInFrames}
          />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
