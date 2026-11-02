import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy status job render dari worker terpisah, supaya dashboard tidak
 * perlu expose RENDER_WORKER_TOKEN ke browser.
 */
export async function GET(req: NextRequest) {
  const workerUrl = process.env.RENDER_WORKER_URL;
  const workerToken = process.env.RENDER_WORKER_TOKEN;
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!workerUrl) {
    return NextResponse.json(
      { error: "RENDER_WORKER_URL belum dikonfigurasi." },
      { status: 500 }
    );
  }
  if (!jobId) {
    return NextResponse.json({ error: "jobId wajib diisi." }, { status: 400 });
  }

  try {
    const res = await fetch(`${workerUrl}/jobs/${jobId}`, {
      headers: workerToken ? { Authorization: `Bearer ${workerToken}` } : {},
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", error: `Worker membalas ${res.status}` },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", error: `Tidak bisa menghubungi worker: ${e.message}` },
      { status: 200 }
    );
  }
}
