# video-engine

Motion graphics video engine berbasis **Remotion** (React).

## Struktur

```
remotion/                 # engine render utama
  src/
    data/                 # naskah (virga, zanzibar)
    scenes/               # visual per scene
    components/           # primitives + subtitles
    VirgaComposition.tsx
    ZanzibarComposition.tsx
    Root.tsx
naskah/                   # referensi naskah JSON
src/                      # dashboard Next.js (preview opsional)
.github/workflows/
  render-remotion.yml     # render manual via Actions
```

## Render video (Remotion)

```bash
cd remotion
npm install
npm run studio            # preview interaktif
npm run render            # Virga → out/virga.mp4
npm run render:zanzibar   # Zanzibar → out/zanzibar.mp4
```

## GitHub Actions

1. Buka tab **Actions**
2. Pilih **Render Remotion Video**
3. **Run workflow** → pilih composition (`Virga` / `Zanzibar`)
4. Unduh artifact **remotion-video**

Workflow hanya jalan manual (tidak auto saat push), supaya commit tidak merah.

## Composition tersedia

| ID | Judul | Durasi |
|----|-------|--------|
| `Virga` | Hujan yang tak menyentuh tanah | ~68s |
| `Zanzibar` | Perang terpendek dalam sejarah | ~92s |
