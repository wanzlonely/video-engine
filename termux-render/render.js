#!/usr/bin/env node
/**
 * Premium 2D story renderer — visuals synced to naskah
 * Usage: node render.js [naskah.json]
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

let createCanvas;
try {
  ({ createCanvas } = require("canvas"));
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

function makeStars(count, seed) {
  const rnd = seeded(seed);
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: rnd() * W, y: rnd() * H * 0.72, r: 0.5 + rnd() * 2, a: 0.25 + rnd() * 0.75, tw: rnd() * Math.PI * 2 });
  }
  return stars;
}
function makeEmbers(count, seed) {
  const rnd = seeded(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: W * 0.12 + rnd() * W * 0.76,
      y: H * 0.4 + rnd() * H * 0.35,
      r: 1.5 + rnd() * 7,
      speed: 0.35 + rnd() * 1.6,
      phase: rnd() * Math.PI * 2,
      hue: 12 + rnd() * 35,
    });
  }
  return list;
}

const starCache = new Map();
const emberCache = new Map();
function starsFor(id) {
  if (!starCache.has(id)) starCache.set(id, makeStars(90, id.split("").reduce((a, c) => a + c.charCodeAt(0), 7)));
  return starCache.get(id);
}
function embersFor(id) {
  if (!emberCache.has(id)) emberCache.set(id, makeEmbers(70, id.split("").reduce((a, c) => a + c.charCodeAt(0), 11)));
  return emberCache.get(id);
}

function fillGradient(ctx, colors, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function vignette(ctx, strength = 0.55) {
  const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.15, W / 2, H * 0.5, H * 0.85);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawStars(ctx, id, t, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const st of starsFor(id)) {
    const tw = 0.45 + 0.55 * Math.sin(t * 2.1 + st.tw);
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${st.a * tw})`;
    ctx.fill();
  }
  ctx.restore();
}

function drawSea(ctx, baseY, t) {
  const sea = ctx.createLinearGradient(0, baseY, 0, H);
  sea.addColorStop(0, "#0c1a2e");
  sea.addColorStop(0.5, "#081018");
  sea.addColorStop(1, "#04060c");
  ctx.fillStyle = sea;
  ctx.fillRect(0, baseY, W, H - baseY);
  ctx.strokeStyle = "rgba(120,180,220,0.12)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const y = baseY + 18 + i * 28 + Math.sin(t * 1.2 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + t + i) * 5);
    }
    ctx.stroke();
  }
}

function drawPalace(ctx, cx, baseY, scale, lit = true) {
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#0a0e16";
  ctx.fillRect(-180, -220, 360, 220);
  ctx.fillRect(-200, -280, 70, 280);
  ctx.fillRect(130, -300, 70, 300);
  ctx.fillRect(-40, -340, 80, 340);
  ctx.beginPath();
  ctx.arc(0, -340, 55, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-3, -420, 6, 80);
  if (lit) {
    ctx.fillStyle = "rgba(255,200,80,0.22)";
    for (let y = -200; y < -20; y += 36) {
      for (let x = -160; x < 160; x += 40) {
        if ((x + y) % 80 === 0) ctx.fillRect(x, y, 14, 18);
      }
    }
  }
  ctx.restore();
}

function drawShip(ctx, x, y, scale, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 1.5) * 3);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#0c1018";
  ctx.beginPath();
  ctx.moveTo(-120, 0);
  ctx.lineTo(-100, 35);
  ctx.lineTo(100, 35);
  ctx.lineTo(130, 0);
  ctx.lineTo(110, -15);
  ctx.lineTo(-90, -15);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-40, -55, 90, 45);
  ctx.fillRect(-20, -80, 40, 30);
  ctx.fillRect(-10, -110, 18, 35);
  ctx.fillRect(20, -105, 16, 30);
  ctx.fillStyle = "rgba(180,180,190,0.25)";
  for (let i = 0; i < 4; i++) {
    const sx = -2 + i * 8 + Math.sin(t * 2 + i) * 6;
    const sy = -120 - i * 18 - (t * 20 + i * 10) % 40;
    ctx.beginPath();
    ctx.arc(sx, sy, 8 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,180,60,0.35)";
  ctx.beginPath();
  ctx.arc(95, -5, 6 + Math.sin(t * 8) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCrown(ctx, cx, cy, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(size / 80, size / 80);
  ctx.fillStyle = "#FFD60A";
  ctx.beginPath();
  ctx.moveTo(-50, 20);
  ctx.lineTo(-40, -25);
  ctx.lineTo(-20, 5);
  ctx.lineTo(0, -40);
  ctx.lineTo(20, 5);
  ctx.lineTo(40, -25);
  ctx.lineTo(50, 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#FF9F0A";
  ctx.beginPath();
  ctx.arc(0, -40, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-45, 18, 90, 12);
  ctx.restore();
}

function drawClock(ctx, cx, cy, r, progress, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(255,200,100,0.85)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r - 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r - 28), Math.sin(a) * (r - 28));
    ctx.lineTo(Math.cos(a) * (r - 12), Math.sin(a) * (r - 12));
    ctx.stroke();
  }
  const ang = -Math.PI / 2 + progress * Math.PI * 1.5;
  ctx.strokeStyle = "#FF453A";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(ang) * (r - 36), Math.sin(ang) * (r - 36));
  ctx.stroke();
  ctx.fillStyle = "#FFD60A";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBlast(ctx, cx, cy, t, power) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 6);
  const rad = power * pulse;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
  g.addColorStop(0, "rgba(255,240,180,0.55)");
  g.addColorStop(0.25, "rgba(255,140,40,0.35)");
  g.addColorStop(0.55, "rgba(255,40,10,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.fill();
}

function visHook(ctx, scene, localT, t) {
  fillGradient(ctx, ["#070b16", "#04060c", "#020308"], 0, H);
  drawStars(ctx, scene.id, t);
  const g = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.55);
  g.addColorStop(0, "rgba(60,90,180,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, 0.5);
}

function visTitle(ctx, scene, localT, t) {
  fillGradient(ctx, ["#10162a", "#080b14", "#04060c"], 0, H);
  drawStars(ctx, scene.id, t, 0.5);
  const a = clamp(localT / 0.6, 0, 1);
  ctx.strokeStyle = `rgba(255,214,10,${0.7 * a})`;
  ctx.lineWidth = 3;
  const lw = lerp(0, W * 0.35, easeOutCubic(a));
  ctx.beginPath();
  ctx.moveTo(W / 2 - lw, H * 0.52);
  ctx.lineTo(W / 2 + lw, H * 0.52);
  ctx.stroke();
  vignette(ctx, 0.55);
}

function visYear(ctx, scene, localT, t) {
  fillGradient(ctx, ["#0c101c", "#06080e"], 0, H);
  const a = clamp(localT / 0.5, 0, 1);
  ctx.strokeStyle = `rgba(255,255,255,${0.08 * a})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.42, 160 + Math.sin(t) * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.42, 200, 0, Math.PI * 2);
  ctx.stroke();
  vignette(ctx, 0.5);
}

function visSetting(ctx, scene, localT, t) {
  fillGradient(ctx, ["#1a2840", "#0c1524", "#060a12"], 0, H);
  const sun = ctx.createRadialGradient(W * 0.7, H * 0.28, 0, W * 0.7, H * 0.28, W * 0.5);
  sun.addColorStop(0, "rgba(255,160,80,0.22)");
  sun.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
  const baseY = H * 0.58;
  drawSea(ctx, baseY, t);
  drawPalace(ctx, W * 0.48, baseY, 1.05, true);
  ctx.fillStyle = "#0a1018";
  ctx.beginPath();
  ctx.moveTo(80, baseY);
  ctx.quadraticCurveTo(60, baseY - 180, 40, baseY - 280);
  ctx.quadraticCurveTo(100, baseY - 200, 120, baseY);
  ctx.fill();
  vignette(ctx, 0.45);
}

function visSultan(ctx, scene, localT, t) {
  fillGradient(ctx, ["#1a1220", "#0c0810", "#060408"], 0, H);
  const a = clamp(localT / 0.7, 0, 1);
  drawCrown(ctx, W / 2, H * 0.28, 140, 0.9 * a);
  const g = ctx.createRadialGradient(W / 2, H * 0.28, 0, W / 2, H * 0.28, 180);
  g.addColorStop(0, "rgba(255,200,60,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(20,16,28,0.9)";
  ctx.fillRect(W * 0.25, H * 0.55, W * 0.5, H * 0.2);
  ctx.fillRect(W * 0.32, H * 0.48, W * 0.36, H * 0.1);
  vignette(ctx, 0.55);
}

function visBritain(ctx, scene, localT, t) {
  fillGradient(ctx, ["#14101c", "#0a0810", "#050408"], 0, H);
  drawStars(ctx, scene.id, t, 0.4);
  ctx.fillStyle = "rgba(40,60,120,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.35);
  ctx.lineTo(W * 0.42, H * 0.45);
  ctx.lineTo(W * 0.42, H);
  ctx.lineTo(0, H);
  ctx.fill();
  ctx.fillStyle = "rgba(120,70,30,0.3)";
  ctx.beginPath();
  ctx.moveTo(W, H * 0.35);
  ctx.lineTo(W * 0.58, H * 0.45);
  ctx.lineTo(W * 0.58, H);
  ctx.lineTo(W, H);
  ctx.fill();
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.strokeStyle = `rgba(255,80,60,${0.35 + 0.25 * pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W * 0.5, H * 0.3);
  ctx.lineTo(W * 0.5, H * 0.75);
  ctx.stroke();
  vignette(ctx, 0.5);
}

function visUltimatum(ctx, scene, localT, t) {
  fillGradient(ctx, ["#241810", "#100a08", "#080504"], 0, H);
  const progress = clamp(localT / scene.duration, 0, 1);
  drawClock(ctx, W / 2, H * 0.32, 130, progress, 0.95);
  const g = ctx.createRadialGradient(W / 2, H * 0.32, 0, W / 2, H * 0.32, 220);
  g.addColorStop(0, `rgba(255,80,40,${0.12 + 0.08 * Math.sin(t * 4)})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, 0.55);
}

function visFire(ctx, scene, localT, t) {
  fillGradient(ctx, ["#1a0a06", "#2a1008", "#0c0604"], 0, H);
  drawBlast(ctx, W * 0.5, H * 0.48, t, 280);
  drawBlast(ctx, W * 0.35, H * 0.55, t * 1.3 + 1, 160);
  drawBlast(ctx, W * 0.65, H * 0.52, t * 0.9 + 2, 180);
  for (const e of embersFor(scene.id)) {
    const life = (t * e.speed + e.phase) % 3.2;
    const y = e.y - life * 100;
    const a = clamp(1 - life / 3.2, 0, 1) * 0.95;
    const r = e.r * (0.65 + 0.35 * Math.sin(t * 5 + e.phase));
    ctx.beginPath();
    ctx.arc(e.x + Math.sin(t * 2 + e.phase) * 14, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${e.hue},100%,58%,${a})`;
    ctx.fill();
  }
  ctx.fillStyle = "rgba(8,4,4,0.95)";
  const baseY = H * 0.72;
  ctx.fillRect(W * 0.22, baseY - 200, 120, 220);
  ctx.fillRect(W * 0.42, baseY - 280, 160, 300);
  ctx.fillRect(W * 0.62, baseY - 180, 110, 200);
  drawSea(ctx, baseY + 20, t);
  drawShip(ctx, W * 0.2, baseY + 40, 0.85, t);
  drawShip(ctx, W * 0.78, baseY + 55, 0.7, t + 1);
  vignette(ctx, 0.4);
}

function visThirtyEight(ctx, scene, localT, t) {
  fillGradient(ctx, ["#0e121c", "#06080c"], 0, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, 280);
  g.addColorStop(0, "rgba(255,214,10,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,214,10,0.25)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.4, 150, 0, Math.PI * 2);
  ctx.stroke();
  vignette(ctx, 0.5);
}

function visCost(ctx, scene, localT, t) {
  fillGradient(ctx, ["#12151c", "#080a0e"], 0, H);
  const baseY = H * 0.62;
  ctx.fillStyle = "#0a0c12";
  ctx.fillRect(W * 0.15, baseY - 160, 90, 180);
  ctx.fillRect(W * 0.32, baseY - 240, 130, 260);
  ctx.fillRect(W * 0.55, baseY - 120, 80, 140);
  ctx.fillRect(W * 0.72, baseY - 200, 100, 220);
  ctx.beginPath();
  ctx.moveTo(W * 0.32, baseY - 240);
  ctx.lineTo(W * 0.38, baseY - 280);
  ctx.lineTo(W * 0.45, baseY - 220);
  ctx.lineTo(W * 0.5, baseY - 240);
  ctx.fill();
  ctx.strokeStyle = "rgba(180,40,40,0.5)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W * 0.48, baseY - 100);
  ctx.lineTo(W * 0.55, baseY - 40);
  ctx.stroke();
  ctx.fillStyle = "rgba(160,30,30,0.45)";
  ctx.beginPath();
  ctx.moveTo(W * 0.55, baseY - 40);
  ctx.lineTo(W * 0.62, baseY - 55);
  ctx.lineTo(W * 0.58, baseY - 20);
  ctx.fill();
  vignette(ctx, 0.55);
}

function visClosing(ctx, scene, localT, t) {
  fillGradient(ctx, ["#080c16", "#04060c", "#020308"], 0, H);
  drawStars(ctx, scene.id, t);
  const g = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.5);
  g.addColorStop(0, "rgba(80,100,180,0.14)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  vignette(ctx, 0.5);
}

function drawSceneBackground(ctx, scene, localT, globalT) {
  const id = scene.id || "";
  if (id === "hook") return visHook(ctx, scene, localT, globalT);
  if (id === "title") return visTitle(ctx, scene, localT, globalT);
  if (id === "year") return visYear(ctx, scene, localT, globalT);
  if (id === "setting") return visSetting(ctx, scene, localT, globalT);
  if (id === "sultan-dies") return visSultan(ctx, scene, localT, globalT);
  if (id === "britain-rejects") return visBritain(ctx, scene, localT, globalT);
  if (id === "ultimatum") return visUltimatum(ctx, scene, localT, globalT);
  if (id === "bombardment") return visFire(ctx, scene, localT, globalT);
  if (id === "thirty-eight") return visThirtyEight(ctx, scene, localT, globalT);
  if (id === "cost") return visCost(ctx, scene, localT, globalT);
  if (id === "closing") return visClosing(ctx, scene, localT, globalT);
  if (scene.type === "fire") return visFire(ctx, scene, localT, globalT);
  if (scene.type === "building") return visSetting(ctx, scene, localT, globalT);
  if (scene.type === "sky") return visHook(ctx, scene, localT, globalT);
  fillGradient(ctx, scene.background?.gradient || ["#0E1018", "#06070C"], 0, H);
  vignette(ctx, 0.5);
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

function drawSceneText(ctx, scene, localT, duration, alphaMul) {
  if (!scene.text?.content) return;
  const fadeIn = Math.min(duration * 0.2, 0.6);
  const fadeOut = Math.min(duration * 0.16, 0.5);
  let alpha = 1;
  if (localT < fadeIn) alpha = easeOutCubic(localT / fadeIn);
  else if (localT > duration - fadeOut) alpha = easeOutCubic((duration - localT) / fadeOut);
  alpha = clamp(alpha * alphaMul, 0, 1);
  if (alpha < 0.02) return;

  const rise = (1 - alpha) * 20;
  const size = scene.text.size || 48;
  const color = scene.text.color || "#FFFFFF";
  const yPct = clamp((scene.text.y ?? 42) / 100, 0.34, 0.48);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapText(ctx, scene.text.content, W * 0.84);
  const lineH = size * 1.28;
  const totalH = lines.length * lineH;
  const cx = W / 2;
  const cy = H * yPct - totalH / 2 + lineH / 2 + rise;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  lines.forEach((ln, i) => ctx.fillText(ln, cx + 3, cy + i * lineH + 4));
  ctx.fillStyle = color;
  lines.forEach((ln, i) => ctx.fillText(ln, cx, cy + i * lineH));
  ctx.restore();
}

function drawSubtitles(ctx, timeSec) {
  const active = subtitles
    .filter((s) => timeSec >= s.start && timeSec < s.end)
    .sort((a, b) => a.start - b.start);
  if (!active.length) return;

  const item = active[active.length - 1];
  const text = String(item.text || "").trim();
  if (!text) return;

  const mid = (item.start + item.end) / 2;
  const half = Math.max(0.05, (item.end - item.start) / 2);
  const dist = Math.abs(timeSec - mid);
  let alpha = 1;
  if (dist > half * 0.75) alpha = clamp(1 - (dist - half * 0.75) / (half * 0.25), 0, 1);

  const fontSize = 40;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapText(ctx, text, W * 0.78).slice(0, 2);
  const lineH = fontSize * 1.3;
  const textW = Math.max(...lines.map((l) => ctx.measureText(l).width), 0);
  const padX = 36, padY = 18;
  const bw = Math.min(W * 0.9, textW + padX * 2);
  const bh = lines.length * lineH + padY * 2;
  const bx = (W - bw) / 2;
  const by = H * 0.905 - bh / 2;

  const vg = ctx.createLinearGradient(0, H * 0.78, 0, H);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, H * 0.78, W, H * 0.22);

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  roundRect(ctx, bx, by, bw, bh, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, bx, by, bw, bh, 18);
  ctx.stroke();

  const cy = by + padY + lineH / 2;
  ctx.fillStyle = "#FFFFFF";
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, cy + i * lineH));
  ctx.restore();
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
  const crf = process.env.RENDER_CRF || "18";
  const ff = spawnSync(
    "ffmpeg",
    ["-y", "-framerate", String(FPS), "-i", path.join(OUT_DIR, "frame_%05d.png"),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", String(crf),
      "-preset", "medium", "-movflags", "+faststart", OUT_MP4],
    { encoding: "utf8" }
  );
  if (ff.status !== 0) {
    console.error("\n[!] ffmpeg gagal:");
    console.error(ff.stderr || ff.stdout);
    process.exit(1);
  }
  console.log(`\n✓  Selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`   → ${OUT_MP4}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
