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

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconFilm = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);

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
        <div className="brand">
          <span className="brand-icon"><IconFilm /></span>
          <div className="brand-text">
            <span className="brand-title">Video Compose</span>
            <span className="brand-sub">Dashboard</span>
          </div>
        </div>
        <div className="actions">
          <label className="btn btn-ghost">
            <IconUpload />
            <span>Import</span>
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </label>
          <button className="btn btn-ghost" onClick={handleExport}>
            <IconDownload />
            <span>Export</span>
          </button>
        </div>
      </header>

      <div className="body">
        <main className="main animate-in">
          <div className="meta-row">
            <input
              className="title-input"
              value={naskah.meta.judul}
              onChange={(e) => updateMeta({ judul: e.target.value })}
              placeholder="Judul naskah…"
            />
            <div className="meta-badges">
              <span className="badge">{naskah.meta.width}×{naskah.meta.height}</span>
              <span className="badge">{naskah.meta.fps} fps</span>
              <span className="badge">{naskah.meta.durasiTotal}s</span>
            </div>
          </div>

          <div className="player-card">
            <div className="player-wrap">
              <Player
                ref={playerRef}
                component={PreviewComposition}
                inputProps={{ naskah }}
                durationInFrames={durationInFrames}
                fps={naskah.meta.fps}
                compositionWidth={naskah.meta.width}
                compositionHeight={naskah.meta.height}
                style={{ width: "100%", maxHeight: "52vh" }}
              />
            </div>
          </div>

          <div className="timeline-section">
            <div className="section-header">
              <div className="section-title">
                <span>Timeline</span>
                <span className="count">{naskah.scenes.length} scene</span>
              </div>
              <button className="btn btn-sm btn-accent" onClick={handleAddScene}>
                <IconPlus />
                <span>Tambah scene</span>
              </button>
            </div>
            <Timeline currentFrame={currentFrame} onSeek={handleSeek} />
          </div>
        </main>

        <aside className="sidebar animate-in" style={{ animationDelay: "80ms" }}>
          <div className="sidebar-section">
            <div className="sidebar-label">Properties</div>
            <SceneEditor />
          </div>
          <div className="sidebar-divider" />
          <div className="sidebar-section">
            <div className="sidebar-label">Render</div>
            <RenderPanel />
          </div>
        </aside>
      </div>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12), transparent),
            var(--bg);
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 56px;
          border-bottom: 1px solid var(--border);
          background: rgba(12, 12, 18, 0.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          box-shadow: 0 0 16px var(--accent-glow);
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .brand-title {
          font-weight: 650;
          font-size: 14px;
          letter-spacing: -0.01em;
        }
        .brand-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-sm);
          padding: 7px 12px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          background: var(--surface-2);
          color: var(--text);
        }
        .btn:hover {
          background: var(--surface-3);
          border-color: rgba(255,255,255,0.14);
          transform: translateY(-1px);
        }
        .btn:active {
          transform: translateY(0);
        }
        .btn-ghost {
          background: transparent;
        }
        .btn-ghost:hover {
          background: var(--surface-2);
        }
        .btn-accent {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          border: none;
          color: #fff;
          box-shadow: 0 2px 12px var(--accent-glow);
        }
        .btn-accent:hover {
          filter: brightness(1.1);
          box-shadow: 0 4px 18px var(--accent-glow);
        }
        .btn-sm {
          padding: 6px 10px;
          font-size: 12px;
        }
        .body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .main {
          flex: 1;
          padding: 20px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .title-input {
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 22px;
          font-weight: 650;
          letter-spacing: -0.02em;
          flex: 1;
          outline: none;
          padding: 4px 0;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .title-input:focus {
          border-bottom-color: var(--accent);
        }
        .title-input::placeholder {
          color: var(--text-muted);
        }
        .meta-badges {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .badge {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-dim);
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 3px 10px;
          letter-spacing: 0.01em;
        }
        .player-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          background: #000;
          box-shadow: var(--shadow);
        }
        .player-wrap {
          display: flex;
          justify-content: center;
          background: linear-gradient(180deg, #0a0a10 0%, #000 100%);
        }
        .timeline-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dim);
        }
        .count {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--surface-2);
          border-radius: 10px;
          padding: 2px 8px;
        }
        .sidebar {
          width: 340px;
          border-left: 1px solid var(--border);
          background: var(--bg-elevated);
          overflow-y: auto;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .sidebar-section {
          padding: 16px;
        }
        .sidebar-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 0 16px;
        }
      `}</style>
    </div>
  );
}
