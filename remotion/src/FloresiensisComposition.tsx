import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { scenes, FPS } from "./data/floresiensis";
import {
  AncientNight, IslandScene, SilhouetteScene, TitleScene,
  CaveScene, ToolsScene, DwarfismScene, ClosingScene,
} from "./scenes/FloresiensisScenes";

const SceneRenderer: React.FC<{ type: string; gradient: string[]; durationFrames: number }> = ({
  type, gradient, durationFrames,
}) => {
  const localFrame = useCurrentFrame();
  const props = { gradient, localFrame, durationFrames };
  if (type === "island") return <IslandScene {...props} />;
  if (type === "silhouette") return <SilhouetteScene {...props} />;
  if (type === "title") return <TitleScene {...props} />;
  if (type === "cave") return <CaveScene {...props} />;
  if (type === "tools") return <ToolsScene {...props} />;
  if (type === "dwarfism") return <DwarfismScene {...props} />;
  if (type === "closing") return <ClosingScene {...props} />;
  return <AncientNight {...props} />;
};

export const FloresiensisComposition: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#06080c" }}>
    {scenes.map((sc) => {
      const from = Math.round(sc.start * FPS);
      const durationInFrames = Math.round(sc.duration * FPS);
      return (
        <Sequence key={sc.id} from={from} durationInFrames={durationInFrames} name={sc.id} layout="none">
          <SceneRenderer type={sc.type} gradient={[...sc.gradient]} durationFrames={durationInFrames} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
