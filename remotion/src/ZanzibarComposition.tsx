import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { scenes, FPS } from "./data/zanzibar";
import { Subtitles } from "./components/Subtitles";
import {
  SceneSky,
  SceneText,
  SceneBuilding,
  SceneCharacter,
  SceneBritain,
  SceneUltimatum,
  SceneFire,
  SceneThirtyEight,
  SceneCost,
} from "./scenes/AllScenes";

const SceneRenderer: React.FC<{
  type: string;
  gradient: string[];
  durationFrames: number;
}> = ({ type, gradient, durationFrames }) => {
  const localFrame = useCurrentFrame();
  const fadeIn = 12;
  const fadeOut = 10;
  const opacity = Math.min(
    interpolate(localFrame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(localFrame, [durationFrames - fadeOut, durationFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const props = { gradient, localFrame, durationFrames };

  let content: React.ReactNode = <SceneSky {...props} />;
  if (type === "text") content = <SceneText {...props} />;
  else if (type === "building") content = <SceneBuilding {...props} />;
  else if (type === "character") content = <SceneCharacter {...props} />;
  else if (type === "britain") content = <SceneBritain {...props} />;
  else if (type === "ultimatum") content = <SceneUltimatum {...props} />;
  else if (type === "fire") content = <SceneFire {...props} />;
  else if (type === "thirtyEight") content = <SceneThirtyEight {...props} />;
  else if (type === "cost") content = <SceneCost {...props} />;
  else if (type === "sky") content = <SceneSky {...props} />;

  return <AbsoluteFill style={{ opacity }}>{content}</AbsoluteFill>;
};

export const ZanzibarComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((sc) => {
        const from = Math.round(sc.start * FPS);
        const durationInFrames = Math.round(sc.duration * FPS);
        return (
          <Sequence key={sc.id} from={from} durationInFrames={durationInFrames} name={sc.id}>
            <SceneRenderer
              type={sc.type}
              gradient={[...sc.gradient]}
              durationFrames={durationInFrames}
            />
          </Sequence>
        );
      })}
      <Subtitles />
    </AbsoluteFill>
  );
};
