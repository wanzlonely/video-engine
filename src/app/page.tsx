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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconUpload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconFilm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
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
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon"><IconFilm /></span>
          <div className="brand-text">
            <strong>Video Compose</strong>
            <span>Dashboard</span>
          </div>
        </div>
        <div className="top-actions">
          <label className="btn">
            <IconUpload />
            <span className="btn-label">Import</span>
            <input type="file" accept=".json" hidden onChange={handleImport} />
          </label>
          <button className="btn" onClick={handleExport}>
            <IconDownload />
            <span className="btn-label">Export</span>
          </button>
        </div>
      </header>

      <div className="content">
        <section className="main">
          <div className="title-row">
            <input
              className="title-input"
              value={naskah.meta.judul}
              onChange={(e) => updateMeta({ judul: e.target.value })}
              placeholder="Judul naskah…"
            />
            <div className="badges">
              <span>{naskah.meta.width}×{naskah.meta.height}</span>
              <span>{naskah.meta.fps}fps</span>
              <span>{naskah.meta.durasiTotal}s</span>
            </div>
          </div>

          <div className="player-box">
            <Player
              ref={playerRef}
              component={PreviewComposition}
              inputProps={{ naskah }}
              durationInFrames={durationInFrames}
              fps={naskah.meta.fps}
              compositionWidth={naskah.meta.width}
              compositionHeight={naskah.meta.height}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <div className="timeline-box">
            <div className="timeline-head">
              <div className="timeline-title">
                Timeline
                <span className="pill">{naskah.scenes.length} scene</span>
              </div>
              <button className="btn btn-accent" onClick={handleAddScene}>
                <IconPlus />
                <span>Tambah</span>
              </button>
            </div>
            <Timeline currentFrame={currentFrame} onSeek={handleSeek} />
          </div>
        </section>

        <aside className="side">
          <div className="side-block">
            <h3 className="side-label">Properties</h3>
            <SceneEditor />
          </div>
          <div className="side-sep" />
          <div className="side-block">
            <h3 className="side-label">Render</h3>
            <RenderPanel />
          </div>
        </aside>
      </div>

      <style jsx>{`
        .app {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          height: 100vh;
          background: var(--bg);
          overflow: hidden;
        }

        .topbar {
          flex-shrink: 0;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-elevated);
          z-index: 20;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .brand-icon {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #fff;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
          min-width: 0;
        }
        .brand-text strong {
          font-size: 13.5px;
          font-weight: 650;
          white-space: nowrap;
        }
        .brand-text span {
          font-size: 10.5px;
          color: var(--text-muted);
        }
        .top-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid var(--border-strong);
          background: var(--surface-2);
          color: var(--text);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .btn:hover {
          background: var(--surface-3);
          border-color: rgba(255,255,255,0.14);
        }
        .btn-accent {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          color: #fff;
        }
        .btn-accent:hover {
          filter: brightness(1.1);
        }

        .content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 320px;
          grid-template-rows: 1fr;
          min-height: 0;
          overflow: hidden;
        }

        .main {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          min-width: 0;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .title-input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 18px;
          font-weight: 650;
          letter-spacing: -0.02em;
          padding: 2px 0;
        }
        .title-input::placeholder {
          color: var(--text-muted);
        }
        .badges {
          display: flex;
          gap: 5px;
          flex-shrink: 0;
        }
        .badges span {
          font-size: 11px;
          color: var(--text-dim);
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2px 8px;
          white-space: nowrap;
        }

        .player-box {
          flex-shrink: 0;
          width: 100%;
          max-width: 280px;
          aspect-ratio: 9 / 16;
          margin: 0 auto;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: #000;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45);
        }

        .timeline-box {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .timeline-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .timeline-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dim);
        }
        .pill {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--surface-2);
          border-radius: 10px;
          padding: 1px 7px;
        }

        .side {
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
          background: var(--bg-elevated);
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .side-block {
          padding: 14px 16px;
        }
        .side-label {
          font-size: 10.5px;
          font-weight: 650;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-muted);
          margin: 0 0 12px;
        }
        .side-sep {
          height: 1px;
          background: var(--border);
          margin: 0 16px;
          flex-shrink: 0;
        }

        @media (max-width: 860px) {
          .content {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            overflow-y: auto;
          }
          .main {
            overflow: visible;
          }
          .side {
            border-left: none;
            border-top: 1px solid var(--border);
            overflow: visible;
          }
          .player-box {
            max-width: 220px;
          }
          .btn-label {
            display: none;
          }
          .title-input {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .topbar {
            padding: 0 12px;
          }
          .main {
            padding: 12px;
            gap: 10px;
          }
          .player-box {
            max-width: 180px;
          }
          .badges {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
