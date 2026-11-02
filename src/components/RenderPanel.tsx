"use client";

import React, { useEffect, useRef } from "react";
import { useNaskahStore } from "@/lib/store";

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconLoader = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="spin">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const RenderPanel: React.FC = () => {
  const naskah = useNaskahStore((s) => s.naskah);
  const job = useNaskahStore((s) => s.job);
  const setJob = useNaskahStore((s) => s.setJob);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBusy = job?.status === "queued" || job?.status === "processing";

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
          // retry next interval
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
        className={`render-btn${isBusy ? " busy" : ""}`}
        onClick={triggerRender}
        disabled={!naskah || isBusy}
      >
        {isBusy ? (
          <>
            <IconLoader />
            <span>Merender…</span>
          </>
        ) : (
          <>
            <IconPlay />
            <span>Render video</span>
          </>
        )}
      </button>

      {job && job.status !== "idle" && (
        <div className={`status status-${job.status}`}>
          <div className="status-header">
            {job.status === "done" && <IconCheck />}
            {job.status === "error" && <IconAlert />}
            {(job.status === "queued" || job.status === "processing") && <IconLoader />}
            <strong>{statusLabel(job.status)}</strong>
          </div>

          {typeof job.progress === "number" && job.status === "processing" && (
            <div className="progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round(job.progress * 100)}%` }}
                />
              </div>
              <span className="progress-pct">{Math.round(job.progress * 100)}%</span>
            </div>
          )}

          {job.status === "done" && job.outputUrl && (
            <a className="download-link" href={job.outputUrl} target="_blank" rel="noreferrer">
              <IconDownload />
              Unduh hasil
            </a>
          )}

          {job.status === "error" && job.error && (
            <p className="error-msg">{job.error}</p>
          )}
        </div>
      )}

      <p className="hint">
        Render dijalankan di worker terpisah (Remotion + Chromium). Dashboard hanya mengirim job & memantau status.
      </p>

      <style jsx>{`
        .panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .render-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: var(--radius);
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
        }
        .render-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.45);
          transform: translateY(-1px);
        }
        .render-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .render-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }
        .render-btn.busy {
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
        }
        .status {
          border-radius: var(--radius-sm);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: var(--surface-2);
          border: 1px solid var(--border);
        }
        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .status-done { border-color: rgba(34, 197, 94, 0.3); }
        .status-done .status-header { color: #4ade80; }
        .status-error { border-color: rgba(239, 68, 68, 0.3); }
        .status-error .status-header { color: #f87171; }
        .status-processing .status-header,
        .status-queued .status-header { color: var(--accent); }
        .progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .progress-track {
          flex: 1;
          height: 6px;
          background: var(--surface-3);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .progress-pct {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-dim);
          font-variant-numeric: tabular-nums;
          min-width: 32px;
          text-align: right;
        }
        .download-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4ade80;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .download-link:hover {
          opacity: 0.8;
        }
        .error-msg {
          font-size: 12px;
          color: #fca5a5;
          line-height: 1.4;
        }
        .hint {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.55;
        }
        :global(.spin) {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
