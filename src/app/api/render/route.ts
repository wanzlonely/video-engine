import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

/**
 * Dashboard ini TIDAK merender video sendiri. Render Remotion butuh
 * headless Chromium + ffmpeg dan bisa berjalan lama — tidak cocok untuk
 * serverless function Vercel (timeout singkat, tanpa Chromium bundled).
 *
 * Route ini hanya memvalidasi payload lalu meneruskan job ke worker
 * render terpisah (mis. VM/Cloud Run/queue) yang menjalankan render.js
 * dari repo video-engine.
 *
 * Env yang dibutuhkan di Vercel:
 *  - RENDER_WORKER_URL   -> endpoint worker, mis. https://render.domainmu.com
 *  - RENDER_WORKER_TOKEN -> shared secret untuk autentikasi ke worker
 */
export async function POST(req: NextRequest) {
  const workerUrl = process.env.RENDER_WORKER_URL;
  const workerToken = process.env.RENDER_WORKER_TOKEN;

  if (!workerUrl) {
    return NextResponse.json(
      { error: "RENDER_WORKER_URL belum dikonfigurasi di environment." },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const naskah = body?.naskah;
  if (!naskah?.meta || !Array.isArray(naskah?.scenes)) {
    return NextResponse.json(
      { error: "Payload naskah tidak lengkap (meta/scenes hilang)." },
      { status: 400 }
    );
  }

  const jobId = nanoid(12);

  try {
    const res = await fetch(`${workerUrl}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(workerToken ? { Authorization: `Bearer ${workerToken}` } : {}),
      },
      body: JSON.stringify({ jobId, naskah }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Worker menolak job (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => ({}));

    return NextResponse.json({
      jobId: data.jobId ?? jobId,
      status: data.status ?? "queued",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Tidak bisa menghubungi worker: ${e.message}` },
      { status: 502 }
    );
  }
}
