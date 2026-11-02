"use client";

import React, { useMemo, useRef, useState } from "react";
import { buildSceneMap, getTimelineDurationFrames } from "@/engine/SceneMap";
import { useNaskahStore } from "@/lib/store";
import { sceneColor } from "@/lib/sceneStyle";

const PX_PER_SEC = 60;

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
  const widthPx = Math.max(totalSec * PX_PER_SEC, 400);

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
      const newDuration = Math.max(
        0.1,
        roundToStep(dragState.origDuration + deltaSec)
      );
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
        <div
          className="playhead"
          style={{ left: secToPx(currentFrame / fps) }}
        />
      </div>

      <div
        className="timeline-track"
        style={{ width: widthPx }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {sceneMap.map((entry) => {
          const isSelected = entry.scene.id === selectedSceneId;
          return (
            <div
              key={entry.scene.id}
              className={`scene-block${isSelected ? " selected" : ""}`}
              style={{
                left: secToPx(entry.scene.start),
                width: Math.max(secToPx(entry.scene.duration), 24),
                background: sceneColor(entry.scene.type),
              }}
              onPointerDown={(e) => handlePointerDown(e, entry.scene.id, "move")}
            >
              <span className="scene-label">
                {entry.scene.type} · {entry.scene.id}
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
          border-radius: 10px;
          background: var(--surface-2);
        }
        .timeline-ruler {
          position: relative;
          height: 28px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
        }
        .tick {
          position: absolute;
          top: 0;
          bottom: 0;
          border-left: 1px solid var(--border);
          padding-left: 4px;
        }
        .tick span {
          font-size: 10px;
          color: var(--text-dim);
        }
        .playhead {
          position: absolute;
          top: 0;
          bottom: -200px;
          width: 2px;
          background: #ef4444;
          z-index: 5;
          pointer-events: none;
        }
        .timeline-track {
          position: relative;
          height: 72px;
          padding: 8px 0;
        }
        .scene-block {
          position: absolute;
          top: 8px;
          height: 56px;
          border-radius: 6px;
          cursor: grab;
          display: flex;
          align-items: center;
          padding: 0 8px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          opacity: 0.9;
        }
        .scene-block.selected {
          outline: 2px solid #fff;
          opacity: 1;
        }
        .scene-label {
          font-size: 11px;
          color: #fff;
          font-family: monospace;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          pointer-events: none;
        }
        .transition-marker {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.35);
          pointer-events: none;
        }
        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 8px;
          cursor: ew-resize;
        }
      `}</style>
    </div>
  );
};

function roundToStep(sec: number, step = 0.1) {
  return Math.round(sec / step) * step;
}
