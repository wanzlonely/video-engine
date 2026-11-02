"use client";

import React, { useEffect, useRef, useState } from "react";
import { Player, PlayerRef } from "@remotion/player";
import { useNaskahStore } from "@/lib/store";
import { PreviewComposition } from "@/components/PreviewComposition";
import { Timeline } from "@/components/Timeline";
import { SceneEditor } from "@/components/SceneEditor";
import { RenderPanel } from "@/components/RenderPanel";
import alexandria from "../../naskah/alexandria.json";
import { Naskah } from "@/engine/types";
import { nanoid } from "nanoid";

export default function Page() {
  const naskah = useNaskahStore((s) => s.naskah);
  const setNaskah = useNaskahStore((s) => s.setNaskah);
  const addScene = useNaskahStore((s) => s.addScene);
  const updateMeta = useNaskahStore((s) => s.updateMeta);

  const playerRef = useRef<PlayerRef>(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!naskah) setNaskah(alexandria as unknown as Naskah);
  }, [naskah, setNaskah]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = () => setCurrentFrame(player.getCurrentFrame());
    player.addEventListener("frameupdate", onFrame);
    return () => player.removeEventListener("frameupdate", onFrame);
  }, [naskah]);

  const handleSeek = (frame: number) => {
    playerRef.current?.seekTo(frame);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Naskah;
        setNaskah(parsed);
      } catch {
        alert("File JSON naskah tidak valid.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExport = () => {
    if (!naskah) return;
    const blob = new Blob([JSON.stringify(naskah, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${naskah.meta.judul.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddScene = () => {
    if (!naskah) return;
    addScene({
      id: `scene-${nanoid(6)}`,
      type: "text",
      start: naskah.meta.durasiTotal,
      duration: 3,
      text: { content: "Teks baru", x: 50, y: 50, size: 48, color: "#FFFFFF" },
    });
  };

  if (!naskah) return null;

  const durationInFrames = Math.round(naskah.meta.durasiTotal * naskah.meta.fps);

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">Video Compose Dashboard</div>
        <div className="actions">
          <label className="file-btn">
            Import naskah
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </label>
          <button onClick={handleExport}>Export naskah</button>
        </div>
      </header>

      <div className="body">
        <main className="main">
          <div className="meta-row">
            <input
              className="title-input"
              value={naskah.meta.judul}
              onChange={(e) => updateMeta({ judul: e.target.value })}
            />
            <span className="dims">
              {naskah.meta.width}×{naskah.meta.height} · {naskah.meta.fps}fps · {naskah.meta.durasiTotal}s
            </span>
          </div>

          <div className="player-wrap">
            <Player
              ref={playerRef}
              component={PreviewComposition}
              inputProps={{ naskah }}
              durationInFrames={durationInFrames}
              fps={naskah.meta.fps}
              compositionWidth={naskah.meta.width}
              compositionHeight={naskah.meta.height}
              style={{ width: "100%", maxHeight: "60vh" }}
            />
          </div>

          <div className="timeline-header">
            <span>Timeline ({naskah.scenes.length} scene)</span>
            <button onClick={handleAddScene}>+ Tambah scene</button>
          </div>
          <Timeline currentFrame={currentFrame} onSeek={handleSeek} />
        </main>

        <aside className="sidebar">
          <SceneEditor />
          <div className="divider" />
          <RenderPanel />
        </aside>
      </div>

      <style jsx>{`
        .layout { display: flex; flex-direction: column; height: 100vh; }
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--surface);
        }
        .brand { font-weight: 600; font-size: 14px; }
        .actions { display: flex; gap: 8px; }
        .actions button, .file-btn {
          background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
          border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;
        }
        .body { display: flex; flex: 1; overflow: hidden; }
        .main { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .meta-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .title-input {
          background: transparent; border: none; color: var(--text); font-size: 20px;
          font-weight: 600; flex: 1; outline: none;
        }
        .dims { font-size: 12px; color: var(--text-dim); white-space: nowrap; }
        .player-wrap {
          background: #000; border-radius: 10px; overflow: hidden;
          display: flex; justify-content: center;
        }
        .timeline-header {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 13px; color: var(--text-dim);
        }
        .timeline-header button {
          background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
          border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer;
        }
        .sidebar {
          width: 320px; border-left: 1px solid var(--border); background: var(--surface);
          overflow-y: auto; flex-shrink: 0;
        }
        .divider { height: 1px; background: var(--border); margin: 0 16px; }
      `}</style>
    </div>
  );
}
