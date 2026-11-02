#!/usr/bin/env node
/**
 * Premium 2D story renderer — visuals synced to naskah
 * Usage: node render.js [naskah.json]
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

let createCanvas, loadImage;
try {
  ({ createCanvas, loadImage } = require("canvas"));
} catch (e) {
  console.error("\n[!] Modul 'canvas' belum terpasang. npm install canvas\n");
  process.exit(1);
}

const naskahPath = process.argv[2] || "zanzibar.json";
if (!fs.existsSync(naskahPath)) {
  console.error(`[!] File tidak ditemukan: ${naskahPath}`);
  process.exit(1);
}

const naskah = JSON.parse(fs.readFileSync(naskahPath, "utf8"));
const { meta, scenes, subtitles = [] } = naskah;
const W = meta.width || 1080;
const H = meta.height || 1920;
const FPS = meta.fps || 30;
const TOTAL_FRAMES = Math.round((meta.durasiTotal || 30) * FPS);

const OUT_DIR = path.join(process.cwd(), "frames");
const safeTitle = (meta.judul || "video").replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").toLowerCase();
const OUT_MP4 = path.join(process.cwd(), "output", `${safeTitle}.mp4`);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(OUT_MP4), { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith(".png")) fs.unlinkSync(path.join(OUT_DIR, f));
}

console.log(`\n▶  ${meta.judul || "Video"}`);
console.log(`   ${W}×${H}  |  ${FPS} fps  |  ${meta.durasiTotal}s  |  ${TOTAL_FRAMES} frames\n`);

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function lerp(a, b, t) { return a + (b - a) * t; }

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ─── Visuals engine (parallax + image-based) ─────────────────────
const createVisuals = require("./visuals");
const visuals = createVisuals({
  W, H, clamp, easeOutCubic, easeInOut, lerp, seeded,
  createCanvas, loadImage,
});

function drawSceneBackground(ctx, scene, localT, globalT) {
  return visuals.drawSceneBackground(ctx, scene, localT, globalT);
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const _typoApi = require("./typography");
let _typo;
function ensureTypo() {
  if (!_typo) {
    _typo = _typoApi({ W, H, clamp, easeOutCubic, wrapText, roundRect, subtitles });
  }
  return _typo;
}
function drawSceneText(ctx, scene, localT, duration, alphaMul) {
  return ensureTypo().drawSceneText(ctx, scene, localT, duration, alphaMul);
}
function drawSubtitles(ctx, timeSec) {
  return ensureTypo().drawSubtitles(ctx, timeSec);
}

function sceneOpacity(scene, timeSec) {
  const start = scene.start;
  const end = scene.start + scene.duration;
  if (timeSec < start || timeSec > end) return 0;
  const local = timeSec - start;
  const tin = scene.transitionIn?.duration || 0.4;
  const tout = 0.35;
  if (local < tin) return easeInOut(local / tin);
  if (local > scene.duration - tout) return easeInOut((scene.duration - local) / tout);
  return 1;
}

function activeScenes(timeSec) {
  return scenes
    .map((sc) => ({ scene: sc, opacity: sceneOpacity(sc, timeSec) }))
    .filter((x) => x.opacity > 0.01)
    .sort((a, b) => a.opacity - b.opacity);
}

function renderFrame(frameIndex) {
  const timeSec = frameIndex / FPS;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const active = activeScenes(timeSec);
  for (const { scene, opacity } of active) {
    const localT = timeSec - scene.start;
    const layer = createCanvas(W, H);
    const lctx = layer.getContext("2d");
    drawSceneBackground(lctx, scene, localT, timeSec);
    ctx.globalAlpha = opacity;
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
  }

  if (active.length) {
    const top = active[active.length - 1];
    const localT = timeSec - top.scene.start;
    drawSceneText(ctx, top.scene, localT, top.scene.duration, top.opacity);
  }

  drawSubtitles(ctx, timeSec);
  return canvas;
}

async function main() {
  // Preload any images defined in layers
  if (visuals.preloadImages) {
    try {
      await visuals.preloadImages(scenes);
      console.log("   Images preloaded");
    } catch (e) {
      console.log("   (no images or preload skipped)");
    }
  }

  const t0 = Date.now();
  let lastLog = 0;
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const canvas = renderFrame(i);
    const outPath = path.join(OUT_DIR, `frame-${String(i).padStart(5, "0")}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

    const now = Date.now();
    if (now - lastLog > 1500 || i === TOTAL_FRAMES - 1) {
      const pct = ((i + 1) / TOTAL_FRAMES * 100).toFixed(1);
      const elapsed = ((now - t0) / 1000).toFixed(1);
      process.stdout.write(`\r   ${pct}%  (${i + 1}/${TOTAL_FRAMES})  ${elapsed}s`);
      lastLog = now;
    }
  }
  console.log("\n");

  const crf = process.env.RENDER_CRF || "18";
  console.log(`▶  Encoding MP4 (crf=${crf})...`);
  const ff = spawnSync("ffmpeg", [
    "-y", "-framerate", String(FPS),
    "-i", path.join(OUT_DIR, "frame-%05d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-crf", crf, "-preset", "medium",
    OUT_MP4,
  ], { stdio: "inherit" });

  if (ff.status !== 0) {
    console.error("ffmpeg failed");
    process.exit(1);
  }

  console.log(`\n✓  Selesai → ${OUT_MP4}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
