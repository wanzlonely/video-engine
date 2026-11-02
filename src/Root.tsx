import React from "react";
import { AbsoluteFill, Audio, Composition } from "remotion";
import { Naskah } from "./engine/types";
import { SceneRenderer } from "./engine/SceneRenderer";
import { SubtitleLayer } from "./engine/SubtitleLayer";
import { buildSceneMap } from "./engine/SceneMap";

interface VideoEngineProps {
  naskah: Naskah;
}

export const VideoEngine: React.FC<VideoEngineProps> = ({ naskah }) => {
  const { meta, scenes, subtitles, narasiAudio } = naskah;
  const sceneMap = buildSceneMap(scenes, meta.fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sceneMap.map((entry) => (
        <SceneRenderer key={entry.scene.id} entry={entry} />
      ))}
      <SubtitleLayer subtitles={subtitles} fps={meta.fps} />
      {narasiAudio ? <Audio src={narasiAudio} /> : null}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  const naskahId = process.env.NASKAH_ID || "alexandria";
  const naskah: Naskah = require(`../naskah/${naskahId}.json`);

  return (
    <Composition
      id="VideoEngine"
      component={VideoEngine}
      durationInFrames={Math.round(
        naskah.meta.durasiTotal * naskah.meta.fps
      )}
      fps={naskah.meta.fps}
      width={naskah.meta.width}
      height={naskah.meta.height}
      defaultProps={{ naskah }}
    />
  );
};
