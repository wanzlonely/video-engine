#!/usr/bin/env node
/**
 * Termux 2D Video Renderer
 * Membaca naskah JSON → frame PNG → MP4 via ffmpeg
 *
 * Usage:
 *   node render.js [naskah.json]
 *   node render.js zanzibar.json
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

let createCanvas, registerFont;
try {
  ({ createCanvas, registerFont } = require("canvas"));
} catch (e) {
  console.error("\n[!] Modul 'canvas' belum terpasang.");
  console.error("    Di Termux jalankan:");
  console.error("      pkg install python make clang binutils");
  console.error("      pkg install libcairo libjpeg-turbo libgif libpangocairo");
  console.error("      npm install");
  console.error("    Lalu coba lagi: node render.js zanzibar.json\n");
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
const OUT_MP4 = path.join(process.cwd(), "output", `${(meta.judul || "video").replace(/\s+/g, "-").toLowerCase()}.mp4`);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(OUT_MP4), { recursive: true });

for (const f of fs.readdirSync(OUT_DIR)) {
  if (f.endsWith(".png")) fs.unlinkSync(path.join(OUT_DIR, f));
}

console.log(`\n▶  ${meta.judul || "Video"}`);
console.log(`   ${W}×${H}  |  ${FPS} fps  |  ${meta.durasiTotal}s  |  ${TOTAL_FRAMES} frames`);
console.log(`   Scene: ${scenes.length}  |  Subtitle: ${subtitles.length}\n`);

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function makeStars(count, seed) {
  const stars = [];
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < count; i++) {
    stars.push({ x: rnd() * W, y: rnd() * H * 0.7, r: 0.6 + rnd() * 1.8, a: 0.3 + rnd() * 0.7, tw: rnd() * Math.PI * 2 });
  }
  return stars;
}

function makeEmbers(count, seed) {
  const list = [];
  let s = seed;
  const rnd = () => { s = (s * 48271) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < count; i++) {
    list.push({ x: W * 0.15 + rnd() * W * 0.7, y: H * 0.35 + rnd() * H * 0.45, r: 2 + rnd() * 8, speed: 0.4 + rnd() * 1.8, phase: rnd() * Math.PI * 2, hue: 15 + rnd() * 40 });
  }
  return list;
}

const starCache = new Map();
const emberCache = new Map();
function starsFor(id) {
  if (!starCache.has(id)) starCache.set(id, makeStars(80, id.split("").reduce((a, c) => a + c.charCodeAt(0), 1)));
  return starCache.get(id);
}
function embersFor(id) {
  if (!emberCache.has(id)) emberCache.set(id, makeEmbers(55, id.split("").reduce((a, c) => a + c.charCodeAt(0), 3)));
  return emberCache.get(id);
}

function drawSky(ctx, scene, localT, globalT) {
  const g = scene.background?.gradient || ["#0A1020", "#04060C"];
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, g[0]);
  grd.addColorStop(1, g[1] || g[0]);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  const stars = starsFor(scene.id);
  for (const st of stars) {
    const tw = 0.5 + 0.5 * Math.sin(globalT * 2.2 + st.tw);
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${st.a * tw})`;
    ctx.fill();
  }
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H * 0.55);
  glow.addColorStop(0, "rgba(80,100,180,0.12)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function drawBuilding(ctx, scene, localT, globalT) {
  const g = scene.background?.gradient || ["#162033", "#080B12"];
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, g[0]);
  grd.addColorStop(1, g[1] || g[0]);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(8,10,18,0.92)";
  const baseY = H * 0.62;
  const buildings = [[0.05, 0.22, 0.28], [0.18, 0.14, 0.38], [0.30, 0.20, 0.32], [0.48, 0.16, 0.42], [0.62, 0.24, 0.26], [0.78, 0.15, 0.36], [0.90, 0.18, 0.30]];
  for (const [xR, wR, hR] of buildings) {
    const x = xR * W, w = wR * W, h = hR * H;
    ctx.fillRect(x, baseY - h, w, h + (H - baseY));
    ctx.fillStyle = "rgba(255,210,100,0.15)";
    for (let wy = baseY - h + 20; wy < baseY - 10; wy += 28) {
      for (let wx = x + 10; wx < x + w - 10; wx += 22) {
        if ((wx + wy) % 3 !== 0) continue;
        ctx.fillRect(wx, wy, 8, 12);
      }
    }
    ctx.fillStyle = "rgba(8,10,18,0.92)";
  }
  const ground = ctx.createLinearGradient(0, baseY, 0, H);
  ground.addColorStop(0, "rgba(20,24,36,1)");
  ground.addColorStop(1, "rgba(6,8,12,1)");
  ctx.fillStyle = ground;
  ctx.fillRect(0, baseY, W, H - baseY);
}

function drawFire(ctx, scene, localT, globalT) {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#1A0A08");
  grd.addColorStop(0.45, "#2A1008");
  grd.addColorStop(1, "#0C0604");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  const fireGlow = ctx.createRadialGradient(W / 2, H * 0.7, 0, W / 2, H * 0.55, W * 0.7);
  fireGlow.addColorStop(0, "rgba(255,120,30,0.35)");
  fireGlow.addColorStop(0.4, "rgba(255,60,10,0.18)");
  fireGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fireGlow;
  ctx.fillRect(0, 0, W, H);
  const embers = embersFor(scene.id);
  for (const e of embers) {
    const life = (globalT * e.speed + e.phase) % 3;
    const y = e.y - life * 90;
    const a = clamp(1 - life / 3, 0, 1) * 0.9;
    const r = e.r * (0.7 + 0.3 * Math.sin(globalT * 5 + e.phase));
    ctx.beginPath();
    ctx.arc(e.x + Math.sin(globalT * 2 + e.phase) * 12, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${e.hue},100%,60%,${a})`;
    ctx.fill();
  }
  ctx.fillStyle = "rgba(10,6,6,0.95)";
  ctx.fillRect(0, H * 0.72, W, H * 0.28);
  ctx.fillRect(W * 0.1, H * 0.55, W * 0.18, H * 0.25);
  ctx.fillRect(W * 0.4, H * 0.48, W * 0.22, H * 0.32);
  ctx.fillRect(W * 0.7, H * 0.58, W * 0.2, H * 0.22);
}

function drawTextBg(ctx, scene) {
  const g = scene.background?.gradient || ["#0E1018", "#06070C"];
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, g[0]);
  grd.addColorStop(1, g[1] || g[0]);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function drawSceneBackground(ctx, scene, localT, globalT) {
  switch (scene.type) {
    case "sky": drawSky(ctx, scene, localT, globalT); break;
    case "building": drawBuilding(ctx, scene, localT, globalT); break;
    case "fire": drawFire(ctx, scene, localT, globalT); break;
    default: drawTextBg(ctx, scene); break;
  }
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawSceneText(ctx, scene, localT, duration) {
  if (!scene.text?.content) return;
  const fadeIn = Math.min(duration * 0.25, 0.7);
  const fadeOut = Math.min(duration * 0.2, 0.6);
  let alpha = 1;
  if (localT < fadeIn) alpha = easeOutCubic(localT / fadeIn);
  else if (localT > duration - fadeOut) alpha = easeOutCubic((duration - localT) / fadeOut);
  alpha = clamp(alpha, 0, 1);
  const rise = (1 - alpha) * 18;
  const size = scene.text.size || 48;
  const color = scene.text.color || "#FFFFFF";
  const xPct = (scene.text.x ?? 50) / 100;
  const yPct = (scene.text.y ?? 50) / 100;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = wrapText(ctx, scene.text.content, W * 0.82);
  const lineH = size * 1.25;
  const totalH = lines.length * lineH;
  const cx = W * xPct;
  const cy = H * yPct - totalH / 2 + lineH / 2 + rise;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  lines.forEach((ln, i) => ctx.fillText(ln, cx + 2, cy + i * lineH + 3));
  ctx.fillStyle = color;
  lines.forEach((ln, i) => ctx.fillText(ln, cx, cy + i * lineH));
  ctx.restore();
}

function drawSubtitles(ctx, timeSec) {
  const active = subtitles.filter((s) => timeSec >= s.start && timeSec < s.end);
  if (!active.length) return;
  const text = active.map((s) => s.text).join(" ");
  ctx.save();
  ctx.font = `600 36px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const padX = 28, padY = 16;
  const tw = ctx.measureText(text).width;
  const th = 36;
  const bx = W / 2 - tw / 2 - padX;
  const by = H * 0.88 - th / 2 - padY;
  const bw = tw + padX * 2;
  const bh = th + padY * 2;
  ctx.fillStyle = "rgba(0,0,0,0.62)";
  roundRect(ctx, bx, by, bw, bh, 14);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, W / 2, H * 0.88);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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
  return scenes.map((sc) => ({ scene: sc, opacity: sceneOpacity(sc, timeSec) })).filter((x) => x.opacity > 0.01);
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
    drawSceneText(lctx, scene, localT, scene.duration);
    ctx.globalAlpha = opacity;
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
  }
  drawSubtitles(ctx, timeSec);
  if (frameIndex % 2 === 0) {
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }
  return canvas;
}

async function main() {
  const t0 = Date.now();
  let lastLog = 0;
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const canvas = renderFrame(i);
    const out = path.join(OUT_DIR, `frame_${String(i).padStart(5, "0")}.png`);
    fs.writeFileSync(out, canvas.toBuffer("image/png"));
    const now = Date.now();
    if (now - lastLog > 800 || i === TOTAL_FRAMES - 1) {
      const pct = ((i + 1) / TOTAL_FRAMES) * 100;
      const elapsed = (now - t0) / 1000;
      const eta = (elapsed / (i + 1)) * (TOTAL_FRAMES - i - 1);
      process.stdout.write(`\r  Frame ${i + 1}/${TOTAL_FRAMES}  (${pct.toFixed(1)}%)  ETA ${eta.toFixed(0)}s   `);
      lastLog = now;
    }
  }
  console.log("\n");
  console.log("▶  Menggabungkan frame → MP4 (ffmpeg)…");
  const ff = spawnSync("ffmpeg", ["-y", "-framerate", String(FPS), "-i", path.join(OUT_DIR, "frame_%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", OUT_MP4], { encoding: "utf8" });
  if (ff.status !== 0) {
    console.error("\n[!] ffmpeg gagal:");
    console.error(ff.stderr || ff.stdout);
    console.error("\nPastikan ffmpeg terpasang: pkg install ffmpeg\n");
    process.exit(1);
  }
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✓  Selesai dalam ${sec}s`);
  console.log(`   → ${OUT_MP4}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
