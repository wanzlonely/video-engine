"use client";

import React, { useMemo, useRef, useState } from "react";
import { buildSceneMap, getTimelineDurationFrames } from "@/engine/SceneMap";
import { useNaskahStore } from "@/lib/store";
import { sceneColor } from "@/lib/sceneStyle";

const PX_PER_SEC = 72;

export const Timeline: React.FC<{ currentFrame: number; onSeek: (f: number) => void }> = ({
  currentFrame,
  onSeek,
}) => {
  const naskah = useNaskahStore((s) => s.naskah);
  const selectedSceneId = useNaskahStore((s) => s.selectedSceneId);
  const selectScene = useNaskahStore((s) => s.selectScene);
  const updateScene = useNaskahStore((s) => s.updateScene);

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    origStart: number;
    origDuration: number;
  } | null>(null);

  const sceneMap = useMemo(
    () => (naskah ? buildSceneMap(naskah.scenes, naskah.meta.fps) : []),
    [naskah]
  );

  if (!naskah) return null;

  const fps = naskah.meta.fps;
  const totalFrames = Math.max(
    getTimelineDurationFrames(sceneMap),
    Math.round(naskah.meta.durasiTotal * fps)
  );
  const totalSec = totalFrames / fps;
  const widthPx = Math.max(totalSec * PX_PER_SEC, 480);

  const secToPx = (sec: number) => sec * PX_PER_SEC;
  const pxToSec = (px: number) => px / PX_PER_SEC;

  const handlePointerDown = (
    e: React.PointerEvent,
    sceneId: string,
    mode: "move" | "resize"
  ) => {
    e.stopPropagation();
    const scene = naskah.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    selectScene(sceneId);
    setDragState({
      id: sceneId,
      mode,
      startX: e.clientX,
      origStart: scene.start,
      origDuration: scene.duration,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    const deltaPx = e.clientX - dragState.startX;
    const deltaSec = pxToSec(deltaPx);

    if (dragState.mode === "move") {
      const newStart = Math.max(0, roundToStep(dragState.origStart + deltaSec));
      updateScene(dragState.id, { start: newStart });
    } else {
      const newDuration = Math.max(0.1, roundToStep(dragState.origDuration + deltaSec));
      updateScene(dragState.id, { duration: newDuration });
    }
  };

  const handlePointerUp = () => setDragState(null);

  const handleRulerClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + trackRef.current.scrollLeft;
    const sec = pxToSec(x);
    onSeek(Math.round(sec * fps));
  };

  return (
    <div className="timeline-wrap" ref={trackRef}>
      <div className="timeline-ruler" style={{ width: widthPx }} onClick={handleRulerClick}>
        {Array.from({ length: Math.ceil(totalSec) + 1 }).map((_, i) => (
          <div key={i} className="tick" style={{ left: secToPx(i) }}>
            <span>{i}s</span>
          </div>
        ))}
        <div className="playhead" style={{ left: secToPx(currentFrame / fps) }}>
          <div className="playhead-head" />
        </div>
      </div>

      <div
        className="timeline-track"
        style={{ width: widthPx }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {sceneMap.map((entry) => {
          const isSelected = entry.scene.id === selectedSceneId;
          const color = sceneColor(entry.scene.type);
          return (
            <div
              key={entry.scene.id}
              className={`scene-block${isSelected ? " selected" : ""}`}
              style={{
                left: secToPx(entry.scene.start),
                width: Math.max(secToPx(entry.scene.duration), 28),
                background: `linear-gradient(135deg, ${color}ee, ${color}bb)`,
                boxShadow: isSelected ? `0 0 0 2px #fff, 0 4px 16px ${color}55` : `0 2px 8px ${color}33`,
              }}
              onPointerDown={(e) => handlePointerDown(e, entry.scene.id, "move")}
            >
              <span className="scene-label">
                <span className="scene-type">{entry.scene.type}</span>
                <span className="scene-id">{entry.scene.id}</span>
              </span>
              {entry.scene.transitionIn && (
                <div
                  className="transition-marker"
                  style={{ width: secToPx(entry.scene.transitionIn.duration) }}
                  title={`transisi: ${entry.scene.transitionIn.type}`}
                />
              )}
              <div
                className="resize-handle"
                onPointerDown={(e) => handlePointerDown(e, entry.scene.id, "resize")}
              />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .timeline-wrap {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .timeline-ruler {
          position: relative;
          height: 32px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          background: var(--surface-2);
        }
        .tick {
          position: absolute;
          top: 0;
          bottom: 0;
          border-left: 1px solid var(--border);
          padding-left: 6px;
          display: flex;
          align-items: center;
        }
        .tick span {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .playhead {
          position: absolute;
          top: 0;
          bottom: -200px;
          width: 2px;
          background: #f43f5e;
          z-index: 10;
          pointer-events: none;
          box-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
        }
        .playhead-head {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background: #f43f5e;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(244, 63, 94, 0.6);
        }
        .timeline-track {
          position: relative;
          height: 80px;
          padding: 12px 0;
        }
        .scene-block {
          position: absolute;
          top: 12px;
          height: 56px;
          border-radius: 10px;
          cursor: grab;
          display: flex;
          align-items: center;
          padding: 0 12px;
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.15s ease;
          user-select: none;
        }
        .scene-block:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }
        .scene-block:active {
          cursor: grabbing;
        }
        .scene-block.selected {
          z-index: 2;
        }
        .scene-label {
          display: flex;
          flex-direction: column;
          gap: 1px;
          pointer-events: none;
          min-width: 0;
        }
        .scene-type {
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .scene-id {
          font-size: 10px;
          color: rgba(255,255,255,0.7);
          font-family: ui-monospace, monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .transition-marker {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 10px 0 0 10px;
          pointer-events: none;
        }
        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 10px;
          cursor: ew-resize;
          border-radius: 0 10px 10px 0;
        }
        .resize-handle:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
};

function roundToStep(sec: number, step = 0.1) {
  return Math.round(sec / step) * step;
}
