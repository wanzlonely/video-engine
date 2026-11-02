"use client";

import React, { useEffect, useRef } from "react";
import { useNaskahStore } from "@/lib/store";

export const RenderPanel: React.FC = () => {
  const naskah = useNaskahStore((s) => s.naskah);
  const job = useNaskahStore((s) => s.job);
  const setJob = useNaskahStore((s) => s.setJob);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerRender = async () => {
    if (!naskah) return;
    setJob({ jobId: "", status: "queued" });

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naskah }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setJob({ jobId: "", status: "error", error: err.error ?? `HTTP ${res.status}` });
        return;
      }

      const data = await res.json();
      setJob({ jobId: data.jobId, status: "processing", progress: 0 });
    } catch (e: any) {
      setJob({ jobId: "", status: "error", error: e.message ?? "Gagal menghubungi worker" });
    }
  };

  useEffect(() => {
    if (job?.status === "processing" && job.jobId) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/status?jobId=${job.jobId}`);
          const data = await res.json();
          setJob({
            jobId: job.jobId,
            status: data.status,
            progress: data.progress,
            outputUrl: data.outputUrl,
            error: data.error,
          });
          if (data.status === "done" || data.status === "error") {
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // worker belum reachable; coba lagi di interval berikutnya
        }
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status, job?.jobId]);

  return (
    <div className="panel">
      <button
        className="primary"
        onClick={triggerRender}
        disabled={!naskah || job?.status === "queued" || job?.status === "processing"}
      >
        {job?.status === "queued" || job?.status === "processing"
          ? "Merender…"
          : "Render video"}
      </button>

      {job && job.status !== "idle" && (
        <div className={`status status-${job.status}`}>
          <strong>{statusLabel(job.status)}</strong>
          {typeof job.progress === "number" && job.status === "processing" && (
            <div className="bar">
              <div className="bar-fill" style={{ width: `${Math.round(job.progress * 100)}%` }} />
            </div>
          )}
          {job.status === "done" && job.outputUrl && (
            <a href={job.outputUrl} target="_blank" rel="noreferrer">
              Unduh hasil
            </a>
          )}
          {job.status === "error" && <p className="error-text">{job.error}</p>}
        </div>
      )}

      <p className="hint">
        Render video (Remotion + ffmpeg/Chromium) dijalankan di worker terpisah,
        bukan di fungsi serverless Vercel ini — dashboard hanya mengirim job dan
        memantau statusnya.
      </p>

      <style jsx>{`
        .panel { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .primary {
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px;
          font-size: 14px;
          cursor: pointer;
        }
        .primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .status { font-size: 13px; display: flex; flex-direction: column; gap: 6px; }
        .status-error { color: #ef4444; }
        .status-done { color: #22c55e; }
        .bar { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: #6366f1; transition: width 0.3s; }
        .hint { font-size: 11px; color: var(--text-dim); line-height: 1.5; }
        .error-text { font-size: 12px; }
        a { color: #6366f1; }
      `}</style>
    </div>
  );
};

function statusLabel(status: string) {
  switch (status) {
    case "queued": return "Dalam antrian…";
    case "processing": return "Sedang dirender…";
    case "done": return "Selesai";
    case "error": return "Gagal";
    default: return status;
  }
}
