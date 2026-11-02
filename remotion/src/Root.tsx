import React from "react";
import { Composition } from "remotion";
import { ZanzibarComposition } from "./ZanzibarComposition";
import { WIDTH, HEIGHT, FPS, TOTAL_FRAMES } from "./data/zanzibar";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Zanzibar"
        component={ZanzibarComposition}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
