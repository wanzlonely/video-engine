import React from "react";
import { Composition } from "remotion";
import { VirgaComposition } from "./VirgaComposition";
import {
  WIDTH as VW,
  HEIGHT as VH,
  FPS as VFPS,
  TOTAL_FRAMES as VFRAMES,
} from "./data/virga";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Virga"
      component={VirgaComposition}
      durationInFrames={VFRAMES}
      fps={VFPS}
      width={VW}
      height={VH}
      defaultProps={{}}
    />
  );
};
