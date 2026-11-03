import React from "react";
import { Composition } from "remotion";
import { FloresiensisComposition } from "./FloresiensisComposition";
import { VirgaComposition } from "./VirgaComposition";
import {
  WIDTH as FW, HEIGHT as FH, FPS as FFPS, TOTAL_FRAMES as FFRAMES,
} from "./data/floresiensis";
import {
  WIDTH as VW, HEIGHT as VH, FPS as VFPS, TOTAL_FRAMES as VFRAMES,
} from "./data/virga";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Floresiensis"
        component={FloresiensisComposition}
        durationInFrames={FFRAMES}
        fps={FFPS}
        width={FW}
        height={FH}
        defaultProps={{}}
      />
      <Composition
        id="Virga"
        component={VirgaComposition}
        durationInFrames={VFRAMES}
        fps={VFPS}
        width={VW}
        height={VH}
        defaultProps={{}}
      />
    </>
  );
};
