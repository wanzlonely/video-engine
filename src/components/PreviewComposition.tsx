import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Naskah, SceneMapEntry } from "@/engine/types";
import { buildSceneMap } from "@/engine/SceneMap";
import { sceneColor } from "@/lib/sceneStyle";

/**
 * Preview placeholder — tidak memuat aset/komponen scene asli dari video-engine
 * (sky/fire/building/dll ada di repo render terpisah). Di sini kita hanya
 * menampilkan blok berwarna + label per SceneType, cukup untuk compose/preview
 * timing, posisi teks, dan urutan transisi tanpa perlu ikut-serta semua
 * dependensi render berat di dashboard Vercel ini.
 */
const SceneBlock: React.FC<{ entry: SceneMapEntry }> = ({ entry }) => {
  const frame = useCurrentFrame();
  const { scene, transitionInFrames } = entry;

  const opacity =
    transitionInFrames > 0
      ? interpolate(frame, [0, transitionInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: sceneColor(scene.type) }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: 28,
          fontFamily: "sans-serif",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {scene.type}
      </AbsoluteFill>

      {scene.background?.gradient && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${scene.background.gradient[0]}, ${scene.background.gradient[1]})`,
          }}
        />
      )}

      {scene.text && (
        <div
          style={{
            position: "absolute",
            left: `${scene.text.x}%`,
            top: `${scene.text.y}%`,
            transform: "translate(-50%, -50%)",
            color: scene.text.color,
            fontSize: scene.text.size,
            fontFamily: "sans-serif",
            fontWeight: 700,
            textAlign: "center",
            maxWidth: "90%",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}
        >
          {scene.text.content}
        </div>
      )}

      {scene.characters?.map((c) => (
        <div
          key={c.id}
          style={{
            position: "absolute",
            left: `${c.x}%`,
            top: `${c.y}%`,
            transform: `translate(-50%, -50%) scale(${c.scale})`,
            width: 120,
            height: 120,
            borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            border: "2px dashed rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            fontFamily: "sans-serif",
          }}
        >
          {c.id}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const PreviewComposition: React.FC<{ naskah: Naskah }> = ({ naskah }) => {
  const sceneMap = buildSceneMap(naskah.scenes, naskah.meta.fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sceneMap.map((entry) => (
        <Sequence
          key={entry.scene.id}
          from={entry.startFrame}
          durationInFrames={entry.durationFrames}
        >
          <SceneBlock entry={entry} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
