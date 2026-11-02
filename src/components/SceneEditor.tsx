"use client";

import React from "react";
import { useNaskahStore } from "@/lib/store";
import { SceneType, TransitionType } from "@/engine/types";

const SCENE_TYPES: SceneType[] = [
  "sky",
  "fire",
  "building",
  "text",
  "character",
  "particles",
];
const TRANSITIONS: TransitionType[] = ["none", "fade", "slide-left", "slide-right", "wipe"];

export const SceneEditor: React.FC = () => {
  const naskah = useNaskahStore((s) => s.naskah);
  const selectedSceneId = useNaskahStore((s) => s.selectedSceneId);
  const updateScene = useNaskahStore((s) => s.updateScene);
  const removeScene = useNaskahStore((s) => s.removeScene);

  const scene = naskah?.scenes.find((s) => s.id === selectedSceneId);

  if (!scene) {
    return (
      <div className="panel">
        <p className="muted">Pilih scene di timeline untuk mengedit propertinya.</p>
        <style jsx>{`
          .panel { padding: 16px; }
          .muted { color: var(--text-dim); font-size: 13px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>{scene.id}</h3>

      <label>
        Tipe scene
        <select
          value={scene.type}
          onChange={(e) => updateScene(scene.id, { type: e.target.value as SceneType })}
        >
          {SCENE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <div className="row">
        <label>
          Mulai (detik)
          <input
            type="number"
            step={0.1}
            value={scene.start}
            onChange={(e) => updateScene(scene.id, { start: Number(e.target.value) })}
          />
        </label>
        <label>
          Durasi (detik)
          <input
            type="number"
            step={0.1}
            value={scene.duration}
            onChange={(e) => updateScene(scene.id, { duration: Number(e.target.value) })}
          />
        </label>
      </div>

      <fieldset>
        <legend>Transisi masuk</legend>
        <div className="row">
          <label>
            Jenis
            <select
              value={scene.transitionIn?.type ?? "none"}
              onChange={(e) => {
                const type = e.target.value as TransitionType;
                if (type === "none") {
                  updateScene(scene.id, { transitionIn: undefined });
                } else {
                  updateScene(scene.id, {
                    transitionIn: { type, duration: scene.transitionIn?.duration ?? 0.5 },
                  });
                }
              }}
            >
              {TRANSITIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Durasi (detik)
            <input
              type="number"
              step={0.1}
              value={scene.transitionIn?.duration ?? 0}
              disabled={!scene.transitionIn}
              onChange={(e) =>
                updateScene(scene.id, {
                  transitionIn: {
                    type: scene.transitionIn!.type,
                    duration: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        </div>
      </fieldset>

      {(scene.type === "text" || scene.text) && (
        <fieldset>
          <legend>Teks</legend>
          <label>
            Konten
            <textarea
              value={scene.text?.content ?? ""}
              onChange={(e) =>
                updateScene(scene.id, {
                  text: { ...(scene.text as any), content: e.target.value },
                })
              }
            />
          </label>
          <div className="row">
            <label>
              X (%)
              <input
                type="number"
                value={scene.text?.x ?? 50}
                onChange={(e) =>
                  updateScene(scene.id, {
                    text: { ...(scene.text as any), x: Number(e.target.value) },
                  })
                }
              />
            </label>
            <label>
              Y (%)
              <input
                type="number"
                value={scene.text?.y ?? 50}
                onChange={(e) =>
                  updateScene(scene.id, {
                    text: { ...(scene.text as any), y: Number(e.target.value) },
                  })
                }
              />
            </label>
          </div>
          <div className="row">
            <label>
              Ukuran
              <input
                type="number"
                value={scene.text?.size ?? 48}
                onChange={(e) =>
                  updateScene(scene.id, {
                    text: { ...(scene.text as any), size: Number(e.target.value) },
                  })
                }
              />
            </label>
            <label>
              Warna
              <input
                type="color"
                value={scene.text?.color ?? "#ffffff"}
                onChange={(e) =>
                  updateScene(scene.id, {
                    text: { ...(scene.text as any), color: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </fieldset>
      )}

      {scene.background?.gradient && (
        <fieldset>
          <legend>Gradient background</legend>
          <div className="row">
            <input
              type="color"
              value={scene.background.gradient[0]}
              onChange={(e) =>
                updateScene(scene.id, {
                  background: {
                    ...scene.background,
                    gradient: [e.target.value, scene.background!.gradient![1]],
                  },
                })
              }
            />
            <input
              type="color"
              value={scene.background.gradient[1]}
              onChange={(e) =>
                updateScene(scene.id, {
                  background: {
                    ...scene.background,
                    gradient: [scene.background!.gradient![0], e.target.value],
                  },
                })
              }
            />
          </div>
        </fieldset>
      )}

      <button className="danger" onClick={() => removeScene(scene.id)}>
        Hapus scene
      </button>

      <style jsx>{`
        .panel { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        h3 { margin: 0; font-family: monospace; font-size: 14px; }
        label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-dim); flex: 1; }
        input, select, textarea {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 8px;
          color: var(--text);
          font-size: 13px;
        }
        textarea { min-height: 60px; resize: vertical; }
        .row { display: flex; gap: 10px; }
        fieldset { border: 1px solid var(--border); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        legend { font-size: 11px; color: var(--text-dim); padding: 0 4px; }
        .danger {
          background: #ef4444;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};
