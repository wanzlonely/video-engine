# Termux 2D Video Renderer

Render naskah JSON (Video Compose) menjadi MP4 di **Termux** tanpa Chromium/Remotion.

## Fitur visual

- Gradient langit + bintang berkedip (`sky`)
- Siluet kota + jendela (`building`)
- Api + ember terbang (`fire`)
- Teks besar fade-in/out + rise
- Subtitle pill di bawah
- Transisi soft antar scene
- Grain film ringan
- Output 1080×1920 (portrait) H.264

## Install di Termux

```bash
pkg update
pkg install nodejs ffmpeg python make clang binutils
pkg install libcairo libjpeg-turbo libgif pangocairo

mkdir -p ~/video-anim && cd ~/video-anim
# salin folder termux-render ke sini (render.js, package.json, zanzibar.json)

npm install
```

> Jika `npm install canvas` gagal, install ulang dependensi native:
> `pkg install xorgproto libx11`
> lalu `npm install` lagi.

## Render

```bash
cd ~/video-anim
node render.js zanzibar.json
```

Hasil: `output/perang-terpendek-dalam-sejarah.mp4`

Progress frame akan tampil di terminal. Di HP mid-range, ~50 detik video bisa 5–20 menit tergantung CPU.

## Naskah lain

```bash
node render.js naskah-lain.json
```

Format sama seperti dashboard (meta, scenes, subtitles).

## Tips kualitas / kecepatan

| Goal | Saran |
|------|--------|
| Lebih cepat | Turunkan dulu `meta.width/height` di JSON (mis. 720×1280) |
| Lebih halus | Naikkan `fps` ke 30 (default) — jangan 60 di HP |
| Hemat storage | Hapus folder `frames/` setelah MP4 jadi |
| Cek hasil | `termux-open output/*.mp4` atau pindah ke gallery |

## Batasan vs Remotion (Vercel dashboard)

| | Termux script | Remotion |
|--|---------------|----------|
| Jalan di HP | Ya | Tidak praktis |
| Sky / fire / building | Versi canvas | Lebih detail |
| Character image | Belum | Ya |
| Preview live | Tidak | Ya (dashboard) |

Pakai dashboard untuk compose, script ini untuk **export MP4 dari HP**.
