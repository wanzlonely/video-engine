# Video Compose Dashboard

UI Next.js terpisah untuk **compose & preview** naskah video dari `video-engine`,
dideploy ke Vercel. Render video sesungguhnya (Remotion + headless Chromium +
ffmpeg) **tidak** jalan di sini — dipicu lewat API route ke **worker terpisah**.

## Kenapa render tidak di Vercel?

Remotion `renderMedia` butuh headless Chromium dan bisa makan waktu lama
(detik–menit tergantung durasi/kompleksitas scene). Serverless function
Vercel punya timeout pendek dan tidak menyediakan Chromium bawaan untuk
render video. Jadi pembagian tugasnya:

- **Dashboard (repo ini, di Vercel)** — compose naskah, preview ringan pakai
  `@remotion/player`, lalu `POST /api/render` yang hanya **meneruskan** job
  (JSON naskah) ke worker.
- **Worker render (terpisah, bukan di repo ini)** — jalankan `render.js` dari
  repo `video-engine` di VM / Cloud Run / container job / queue worker, yang
  punya resource & waktu eksekusi cukup untuk render.

## Struktur

```
src/
  engine/
    types.ts       # disalin apa adanya dari video-engine — single source of truth tipe Naskah/Scene
    SceneMap.ts     # disalin apa adanya — resolver frame timeline (dipakai Timeline & Player)
  components/
    PreviewComposition.tsx  # composition Remotion ringan (blok warna per SceneType) untuk Player
    Timeline.tsx             # visual timeline berbasis buildSceneMap(): drag-move, drag-resize, playhead
    SceneEditor.tsx          # form edit properti scene terpilih
    RenderPanel.tsx          # trigger render + polling status job
  lib/
    store.ts         # zustand store untuk naskah yang sedang di-compose
    sceneStyle.ts     # warna per SceneType
  app/
    page.tsx            # halaman utama (layout: player, timeline, sidebar)
    api/render/route.ts  # POST -> forward job ke RENDER_WORKER_URL
    api/status/route.ts  # GET  -> proxy status job dari worker
```

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi RENDER_WORKER_URL & RENDER_WORKER_TOKEN
npm run dev
```

Buka `http://localhost:3000`. Naskah contoh (`naskah/alexandria.json`) dimuat
otomatis saat pertama kali buka; bisa diganti lewat tombol **Import naskah**
(upload file `.json` berformat `Naskah`) atau diekspor lewat **Export naskah**.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import project di Vercel, framework terdeteksi otomatis sebagai Next.js.
3. Set environment variables di Vercel project settings:
   - `RENDER_WORKER_URL`
   - `RENDER_WORKER_TOKEN`
4. Deploy.

## Kontrak API worker

### `POST {RENDER_WORKER_URL}/jobs`

Request: `{ "jobId": "...", "naskah": { ... } }`

Response: `{ "jobId": "...", "status": "queued" }`

### `GET {RENDER_WORKER_URL}/jobs/:jobId`

Response: `{ "status": "processing" | "done" | "error", "progress"?, "outputUrl"?, "error"? }`

Autentikasi: header `Authorization: Bearer <RENDER_WORKER_TOKEN>`.
