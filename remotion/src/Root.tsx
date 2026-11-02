import React from "react";
import { Composition } from "remotion";
import { ZanzibarComposition } from "./ZanzibarComposition";
import { VirgaComposition } from "./VirgaComposition";
import {
  WIDTH as ZW,
  HEIGHT as ZH,
  FPS as ZFPS,
  TOTAL_FRAMES as ZFRAMES,
} from "./data/zanzibar";
import {
  WIDTH as VW,
  HEIGHT as VH,
  FPS as VFPS,
  TOTAL_FRAMES as VFRAMES,
} from "./data/virga";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Virga"
        component={VirgaComposition}
        durationInFrames={VFRAMES}
        fps={VFPS}
        width={VW}
        height={VH}
        defaultProps={{}}
      />
      <Composition
        id="Zanzibar"
        component={ZanzibarComposition}
        durationInFrames={ZFRAMES}
        fps={ZFPS}
        width={ZW}
        height={ZH}
        defaultProps={{}}
      />
    </>
  );
};
