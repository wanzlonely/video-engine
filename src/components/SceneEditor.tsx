"use client";

import React from "react";
import { useNaskahStore } from "@/lib/store";
import { SceneType, TransitionType } from "@/engine/types";

const SCENE_TYPES: SceneType[] = [
  "sky", "fire", "building", "text", "character", "particles",
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
      <div className="empty">
        <div className="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
          </svg>
        </div>
        <p>Pilih scene di timeline untuk mengedit propertinya.</p>
        <style jsx>{`
          .empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 28px 16px;
            text-align: center;
          }
          .empty-icon {
            color: var(--text-muted);
            opacity: 0.5;
          }
          p {
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.5;
            max-width: 200px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="scene-id-row">
        <code>{scene.id}</code>
      </div>

      <label className="field">
        <span>Tipe scene</span>
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
        <label className="field">
          <span>Mulai (s)</span>
          <input
            type="number"
            step={0.1}
            value={scene.start}
            onChange={(e) => updateScene(scene.id, { start: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Durasi (s)</span>
          <input
            type="number"
            step={0.1}
            value={scene.duration}
            onChange={(e) => updateScene(scene.id, { duration: Number(e.target.value) })}
          />
        </label>
      </div>

      <fieldset className="group">
        <legend>Transisi masuk</legend>
        <div className="row">
          <label className="field">
            <span>Jenis</span>
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
          <label className="field">
            <span>Durasi (s)</span>
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
        <fieldset className="group">
          <legend>Teks</legend>
          <label className="field">
            <span>Konten</span>
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
            <label className="field">
              <span>X (%)</span>
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
            <label className="field">
              <span>Y (%)</span>
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
            <label className="field">
              <span>Ukuran</span>
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
            <label className="field">
              <span>Warna</span>
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
        <fieldset className="group">
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

      <button className="btn-danger" onClick={() => removeScene(scene.id)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Hapus scene
      </button>

      <style jsx>{`
        .editor {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .scene-id-row code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          color: var(--accent);
          background: var(--accent-soft);
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
        .field span {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }
        input, select, textarea {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          color: var(--text);
          font-size: 13px;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        input:disabled {
          opacity: 0.4;
        }
        textarea {
          min-height: 64px;
          resize: vertical;
        }
        input[type="color"] {
          height: 36px;
          padding: 3px;
          cursor: pointer;
        }
        .row {
          display: flex;
          gap: 10px;
        }
        .group {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255,255,255,0.015);
        }
        legend {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-dim);
          padding: 0 6px;
          letter-spacing: 0.03em;
        }
        .btn-danger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-sm);
          padding: 9px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
          margin-top: 4px;
        }
        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.22);
          border-color: rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
};
