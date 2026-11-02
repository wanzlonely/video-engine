/**
 * visuals.js — Premium visual effects engine driven by naskah data.
 *
 * RULE: Ketika naskah diganti, update registry atau helper di file ini
 * agar efek visual tetap premium, hidup, dan selaras dengan konten baru.
 *
 * Setiap scene.type punya visualizer. Scene.id bisa override untuk
 * cerita spesifik (mis. "bombardment" → fire ekstrem + kapal + asap).
 *
 * Versi ini ditingkatkan: particle lebih kaya, lighting dinamis,
 * elemen cerita (istana, kapal, mahkota, jam, bendera), laut hidup,
 * film grain & vignette yang lebih cinematic.
 */

function createVisuals(deps) {
  const {
    W, H, clamp, easeOutCubic, easeInOut, lerp, seeded,
    createCanvas,
  } = deps;

  // ─── Core helpers ───────────────────────────────────────────────
  function fillGradient(ctx, colors, y0 = 0, y1 = H) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    const list = Array.isArray(colors) ? colors : ["#0E1018", "#06070C"];
    list.forEach((c, i) => g.addColorStop(i / Math.max(1, list.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function vignette(ctx, strength = 0.55) {
    const v = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.1, W / 2, H * 0.5, H * 0.92);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.65, `rgba(0,0,0,${strength * 0.35})`);
    v.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  function filmGrain(ctx, t, amount = 0.032) {
    ctx.save();
    ctx.globalAlpha = amount;
    const rnd = seeded(Math.floor(t * 28) + 91);
    for (let i = 0; i < 220; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const s = 0.8 + rnd() * 2.4;
      ctx.fillStyle = rnd() > 0.52 ? "#fff" : "#000";
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();
  }

  function softGlow(ctx, cx, cy, radius, color, alpha = 0.2) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const match = color.match(/#([0-9a-f]{6})/i);
    if (match) {
      const hex = match[1];
      const r = parseInt(hex.slice(0, 2), 16);
      const g2 = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      g.addColorStop(0, `rgba(${r},${g2},${b},${alpha})`);
    } else {
      g.addColorStop(0, color);
    }
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Caches ─────────────────────────────────────────────────────
  const starCache = new Map();
  const emberCache = new Map();
  const particleCache = new Map();

  function makeStars(count, seed) {
    const rnd = seeded(seed);
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rnd() * W,
        y: rnd() * H * 0.68,
        r: 0.45 + rnd() * 2.3,
        a: 0.2 + rnd() * 0.8,
        tw: rnd() * Math.PI * 2,
        speed: 0.8 + rnd() * 1.4,
      });
    }
    return stars;
  }

  function makeEmbers(count, seed) {
    const rnd = seeded(seed);
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: W * 0.08 + rnd() * W * 0.84,
        y: H * 0.32 + rnd() * H * 0.42,
        r: 1.2 + rnd() * 7.5,
        speed: 0.28 + rnd() * 1.9,
        phase: rnd() * Math.PI * 2,
        hue: 6 + rnd() * 42,
        drift: 18 + rnd() * 28,
      });
    }
    return list;
  }

  function makeDust(count, seed) {
    const rnd = seeded(seed);
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: rnd() * W,
        y: rnd() * H,
        r: 0.6 + rnd() * 2.2,
        speed: 8 + rnd() * 22,
        phase: rnd() * Math.PI * 2,
        a: 0.08 + rnd() * 0.22,
      });
    }
    return list;
  }

  function starsFor(id) {
    if (!starCache.has(id)) {
      const seed = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 7);
      starCache.set(id, makeStars(160, seed));
    }
    return starCache.get(id);
  }

  function embersFor(id) {
    if (!emberCache.has(id)) {
      const seed = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 13);
      emberCache.set(id, makeEmbers(145, seed));
    }
    return emberCache.get(id);
  }

  function dustFor(id) {
    if (!particleCache.has(id)) {
      const seed = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 29);
      particleCache.set(id, makeDust(70, seed));
    }
    return particleCache.get(id);
  }

  function drawStars(ctx, id, t, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const st of starsFor(id)) {
      const tw = 0.32 + 0.68 * Math.sin(t * 2.1 * st.speed + st.tw);
      const dx = Math.sin(t * 0.13 + st.tw) * 2.8;
      const dy = Math.cos(t * 0.1 + st.tw * 0.75) * 1.9;
      ctx.beginPath();
      ctx.arc(st.x + dx, st.y + dy, st.r * (0.82 + 0.3 * tw), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${st.a * tw})`;
      ctx.fill();
      if (st.a > 0.65 && tw > 0.7) {
        ctx.beginPath();
        ctx.arc(st.x + dx, st.y + dy, st.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${st.a * tw * 0.12})`;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawDust(ctx, id, t, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const p of dustFor(id)) {
      const x = (p.x + t * p.speed * 0.35 + Math.sin(t * 0.4 + p.phase) * 12) % W;
      const y = (p.y + Math.sin(t * 0.55 + p.phase) * 18) % H;
      ctx.beginPath();
      ctx.arc(x < 0 ? x + W : x, y < 0 ? y + H : y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,225,255,${p.a})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── Story elements ─────────────────────────────────────────────
  function drawSea(ctx, baseY, t, intensity = 1) {
    const sea = ctx.createLinearGradient(0, baseY, 0, H);
    sea.addColorStop(0, "#0b182c");
    sea.addColorStop(0.45, "#07121f");
    sea.addColorStop(1, "#03060c");
    ctx.fillStyle = sea;
    ctx.fillRect(0, baseY, W, H - baseY);

    ctx.strokeStyle = `rgba(120,185,230,${0.1 * intensity})`;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 6; i++) {
      const y = baseY + 12 + i * 24 + Math.sin(t * 1.45 + i * 0.9) * 5.5 * intensity;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) {
        ctx.lineTo(x, y + Math.sin(x * 0.015 + t * 1.25 + i) * 6.5 * intensity);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(180,220,255,${0.06 * intensity})`;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const y = baseY + 8 + i * 38 + Math.sin(t * 1.8 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 48) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + t * 1.6 + i * 2) * 4);
      }
      ctx.stroke();
    }
  }

  function drawPalace(ctx, cx, baseY, scale, lit = true, damage = 0) {
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#0a0e16";
    ctx.fillRect(-190, -230, 380, 235);
    ctx.fillRect(-215, -295, 78, 300);
    ctx.fillRect(137, -315, 78, 320);
    ctx.fillRect(-48, -360, 96, 365);
    ctx.beginPath();
    ctx.arc(0, -360, 58, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-3, -445, 6, 90);

    if (lit) {
      ctx.fillStyle = `rgba(255,195,70,${0.22 - damage * 0.12})`;
      for (let y = -210; y y < -25; y += 34) {
        for (let x = -170; x < 170; x += 38) {
          if ((x + y) % 76 < 40) {
            ctx.fillRect(x, y, 13, 16);
          }
        }
      }
      for (let y = -280; y < -40; y += 40) {
        ctx.fillRect(-195, y, 11, 14);
        ctx.fillRect(155, y, 11, 14);
      }
    }

    if (damage > 0.2) {
      ctx.fillStyle = "rgba(8,4,4,0.85)";
      ctx.beginPath();
      ctx.moveTo(-80, -230);
      ctx.lineTo(-40, -280 - damage * 40);
      ctx.lineTo(10, -240);
      ctx.lineTo(50, -300 - damage * 30);
      ctx.lineTo(90, -230);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawShip(ctx, x, y, scale, t, smoke = true) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 1.55) * 3.5);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#0b1018";
    ctx.beginPath();
    ctx.moveTo(-125, 0);
    ctx.lineTo(-105, 38);
    ctx.lineTo(105, 38);
    ctx.lineTo(138, 0);
    ctx.lineTo(115, -16);
    ctx.lineTo(-95, -16);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(-42, -58, 95, 48);
    ctx.fillRect(-22, -85, 48, 32);
    ctx.fillRect(-12, -125, 14, 45);
    ctx.fillRect(22, -118, 12, 38);

    const flash = 0.35 + 0.65 * Math.sin(t * 9 + x * 0.01);
    if (flash > 0.75) {
      ctx.fillStyle = `rgba(255,180,60,${(flash - 0.75) * 1.6})`;
      ctx.beginPath();
      ctx.arc(95, -6, 5 + flash * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (smoke) {
      ctx.fillStyle = "rgba(160,165,175,0.22)";
      for (let i = 0; i < 5; i++) {
        const sx = -4 + i * 9 + Math.sin(t * 1.8 + i) * 7;
        const sy = -130 - i * 16 - ((t * 22 + i * 12) % 48);
        const sr = 7 + i * 2.2 + Math.sin(t * 2 + i) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawCrown(ctx, cx, cy, size, alpha, t = 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy + Math.sin(t * 1.3) * 6);
    ctx.scale(size / 80, size / 80);

    const g = ctx.createRadialGradient(0, -10, 0, 0, -10, 90);
    g.addColorStop(0, "rgba(255,200,60,0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -10, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFD60A";
    ctx.beginPath();
    ctx.moveTo(-52, 22);
    ctx.lineTo(-42, -28);
    ctx.lineTo(-20, 6);
    ctx.lineTo(0, -44);
    ctx.lineTo(20, 6);
    ctx.lineTo(42, -28);
    ctx.lineTo(52, 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#FF9F0A";
    ctx.beginPath();
    ctx.arc(0, -44, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-42, -28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(42, -28, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.fillRect(-48, 18, 96, 14);

    ctx.restore();
  }

  function drawClock(ctx, cx, cy, r, progress, alpha, t) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);

    const pulse = 0.5 + 0.5 * Math.sin(t * 4.5);
    const g = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.35);
    g.addColorStop(0, `rgba(255,90,40,${0.12 + 0.1 * pulse})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,200,100,0.9)";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r - 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 3.2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 30), Math.sin(a) * (r - 30));
      ctx.lineTo(Math.cos(a) * (r - 14), Math.sin(a) * (r - 14));
      ctx.stroke();
    }

    const ang = -Math.PI / 2 + progress * Math.PI * 1.55;
    ctx.strokeStyle = "#FF453A";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ang) * (r - 38), Math.sin(ang) * (r - 38));
    ctx.stroke();

    ctx.fillStyle = "#FFD60A";
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawFlag(ctx, x, y, w, h, t, color = "#c41e3a") {
    ctx.save();
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x - 3, y - h * 0.15, 6, h * 1.25);

    ctx.beginPath();
    ctx.moveTo(x, y);
    const segs = 8;
    for (let i = 0; i <= segs; i++) {
      const px = x + (i / segs) * w;
      const py = y + Math.sin(t * 3.2 + i * 0.7) * 7 + (i / segs) * 2;
      ctx.lineTo(px, py);
    }
    for (let i = segs; i >= 0; i--) {
      const px = x + (i / segs) * w;
      const py = y + h + Math.sin(t * 3.2 + i * 0.7 + 0.4) * 6;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + 4, y + h * 0.35, w * 0.7, h * 0.12);
    ctx.restore();
  }

  function drawBlast(ctx, cx, cy, t, power) {
    const pulse = 0.52 + 0.48 * Math.sin(t * 7.4);
    const rad = power * pulse;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, "rgba(255,245,190,0.55)");
    g.addColorStop(0.18, "rgba(255,160,50,0.38)");
    g.addColorStop(0.45, "rgba(255,50,15,0.18)");
    g.addColorStop(0.75, "rgba(80,10,5,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Scene visualizers ──────────────────────────────────────────
  function visSky(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#070b16", "#04060c", "#020308"];
    fillGradient(ctx, colors);
    drawStars(ctx, scene.id, globalT, 0.95);
    drawDust(ctx, scene.id, globalT, 0.7);

    const g = ctx.createRadialGradient(W * 0.52, H * 0.28, 0, W * 0.52, H * 0.28, W * 0.58);
    g.addColorStop(0, "rgba(65,105,195,0.17)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(
      W * 0.22 + Math.sin(globalT * 0.18) * 50,
      H * 0.52,
      0,
      W * 0.22,
      H * 0.52,
      W * 0.42
    );
    g2.addColorStop(0, "rgba(110,55,160,0.09)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    vignette(ctx, 0.52);
    filmGrain(ctx, globalT, 0.028);
  }

  function visBuilding(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#1a2840", "#0c1524", "#060a12"];
    fillGradient(ctx, colors);

    const sun = ctx.createRadialGradient(W * 0.68, H * 0.26, 0, W * 0.68, H * 0.26, W * 0.55);
    sun.addColorStop(0, "rgba(255,155,70,0.22)");
    sun.addColorStop(0.5, "rgba(255,120,40,0.06)");
    sun.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H);

    const baseY = H * 0.58;
    drawSea(ctx, baseY, globalT, 1.05);
    drawPalace(ctx, W * 0.48, baseY, 1.08, true, 0);

    ctx.fillStyle = "#080e16";
    ctx.beginPath();
    ctx.moveTo(40, baseY);
    ctx.quadraticCurveTo(30, baseY - 160, 15, baseY - 260);
    ctx.quadraticCurveTo(70, baseY - 190, 95, baseY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W - 30, baseY);
    ctx.quadraticCurveTo(W - 50, baseY - 140, W - 20, baseY - 220);
    ctx.quadraticCurveTo(W - 90, baseY - 160, W - 110, baseY);
    ctx.fill();

    const glow = ctx.createRadialGradient(W * 0.48, baseY - 180, 0, W * 0.48, baseY - 100, 220);
    glow.addColorStop(0, "rgba(255,200,100,0.07)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    vignette(ctx, 0.46);
    filmGrain(ctx, globalT, 0.03);
  }

  function visFire(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#1a0a06", "#2a1008", "#0c0604"];
    fillGradient(ctx, colors);

    drawBlast(ctx, W * 0.5, H * 0.46, globalT, 310);
    drawBlast(ctx, W * 0.33, H * 0.55, globalT * 1.28 + 0.9, 175);
    drawBlast(ctx, W * 0.67, H * 0.51, globalT * 0.92 + 1.7, 195);
    drawBlast(ctx, W * 0.45, H * 0.6, globalT * 1.1 + 2.4, 120);

    for (const e of embersFor(scene.id)) {
      const life = (globalT * e.speed * 1.18 + e.phase) % 3.8;
      const y = e.y - life * 145;
      const a = clamp(1 - life / 3.8, 0, 1) * 0.96;
      const r = e.r * (0.68 + 0.45 * Math.sin(globalT * 5.8 + e.phase));
      const x = e.x + Math.sin(globalT * 2.2 + e.phase) * e.drift;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${e.hue},100%,58%,${a})`;
      ctx.fill();
      if (a > 0.32) {
        ctx.beginPath();
        ctx.arc(x, y + r * 2.5, r * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue + 16},100%,68%,${a * 0.48})`;
        ctx.fill();
      }
    }

    const baseY = H * 0.72;
    ctx.fillStyle = "rgba(8,4,4,0.96)";
    ctx.fillRect(W * 0.2, baseY - 205, 118, 225);
    ctx.fillRect(W * 0.4, baseY - 285, 165, 305);
    ctx.fillRect(W * 0.62, baseY - 175, 108, 195);

    ctx.beginPath();
    ctx.moveTo(W * 0.4, baseY - 285);
    ctx.lineTo(W * 0.45, baseY - 330);
    ctx.lineTo(W * 0.52, baseY - 270);
    ctx.lineTo(W * 0.58, baseY - 310);
    ctx.lineTo(W * 0.565, baseY - 285);
    ctx.fill();

    drawSea(ctx, baseY + 18, globalT, 0.9);

    drawShip(ctx, W * 0.18, baseY + 48, 0.88, globalT, true);
    drawShip(ctx, W * 0.8, baseY + 62, 0.72, globalT + 1.3, true);

    vignette(ctx, 0.4);
    filmGrain(ctx, globalT, 0.042);
  }

  function visCharacter(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#1a1220", "#0c0810", "#060408"];
    fillGradient(ctx, colors);

    const a = clamp(localT / 0.65, 0, 1);
    drawCrown(ctx, W / 2, H * 0.27, 150, 0.92 * easeOutCubic(a), globalT);

    const key = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.5);
    key.addColorStop(0, "rgba(255,190,90,0.18)");
    key.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = key;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(18,14,22,0.92)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.78, W * 0.38, H * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(28,20,16,0.9)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.56, 78, 98, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(W / 2 - 62, H * 0.6, 124, 175);

    vignette(ctx, 0.58);
    filmGrain(ctx, globalT, 0.03);
  }

  function visText(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#10162a", "#080b14", "#04060c"];
    fillGradient(ctx, colors);
    drawStars(ctx, scene.id, globalT, 0.4);
    drawDust(ctx, scene.id, globalT, 0.5);

    const a = clamp(localT / 0.55, 0, 1);
    const e = easeOutCubic(a);
    ctx.strokeStyle = `rgba(255,214,10,${0.72 * e})`;
    ctx.lineWidth = 2.8;
    const lw = lerp(0, W * 0.34, e);
    ctx.beginPath();
    ctx.moveTo(W / 2 - lw, H * 0.52);
    ctx.lineTo(W / 2 + lw, H * 0.52);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,214,10,${0.25 * e})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - lw * 0.7, H * 0.52 + 10);
    ctx.lineTo(W / 2 + lw * 0.7, H * 0.52 + 10);
    ctx.stroke();

    vignette(ctx, 0.55);
    filmGrain(ctx, globalT, 0.025);
  }

  function visUltimatum(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#241810", "#100a08", "#080504"];
    fillGradient(ctx, colors);

    const progress = clamp(localT / (scene.duration || 8), 0, 1);
    drawClock(ctx, W / 2, H * 0.3, 138, progress, 0.96, globalT);

    const rnd = seeded(77);
    for (let i = 0; i < 40; i++) {
      const ang = rnd() * Math.PI * 2;
      const dist = 160 + rnd() * 120 + Math.sin(globalT * 2 + i) * 20;
      const px = W / 2 + Math.cos(ang + globalT * 0.3) * dist;
      const py = H * 0.3 + Math.sin(ang + globalT * 0.3) * dist * 0.7;
      const pa = 0.08 + rnd() * 0.18;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + rnd() * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,120,60,${pa})`;
      ctx.fill();
    }

    vignette(ctx, 0.55);
    filmGrain(ctx, globalT, 0.032);
  }

  function visBritain(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#14101c", "#0a0810", "#050408"];
    fillGradient(ctx, colors);
    drawStars(ctx, scene.id, globalT, 0.45);

    ctx.fillStyle = "rgba(35,55,110,0.38)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.32);
    ctx.lineTo(W * 0.44, H * 0.44);
    ctx.lineTo(W * 0.44, H);
    ctx.lineTo(0, H);
    ctx.fill();

    ctx.fillStyle = "rgba(115,65,28,0.32)";
    ctx.beginPath();
    ctx.moveTo(W, H * 0.32);
    ctx.lineTo(W * 0.56, H * 0.44);
    ctx.lineTo(W * 0.56, H);
    ctx.lineTo(W, H);
    ctx.fill();

    const pulse = 0.45 + 0.55 * Math.sin(globalT * 3.2);
    ctx.strokeStyle = `rgba(255,70,50,${0.3 + 0.28 * pulse})`;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.28);
    ctx.lineTo(W * 0.5, H * 0.78);
    ctx.stroke();

    drawFlag(ctx, W * 0.18, H * 0.38, 70, 42, globalT, "#012169");
    drawFlag(ctx, W * 0.72, H * 0.4, 70, 42, globalT + 1, "#c41e3a");

    vignette(ctx, 0.5);
    filmGrain(ctx, globalT, 0.03);
  }

  function visThirtyEight(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#0e121c", "#06080c"];
    fillGradient(ctx, colors);

    const g = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 300);
    g.addColorStop(0, "rgba(255,214,10,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const a = 0.2 + 0.15 * Math.sin(globalT * 2.5);
    ctx.strokeStyle = `rgba(255,214,10,${a})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.38, 155 + Math.sin(globalT * 1.5) * 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,214,10,${a * 0.5})`;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.38, 200 + Math.sin(globalT * 1.2) * 4, 0, Math.PI * 2);
    ctx.stroke();

    vignette(ctx, 0.5);
    filmGrain(ctx, globalT, 0.028);
  }

  function visCost(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#12151c", "#080a0e"];
    fillGradient(ctx, colors);

    const baseY = H * 0.62;
    ctx.fillStyle = "#0a0c12";
    ctx.fillRect(W * 0.12, baseY - 155, 95, 175);
    ctx.fillRect(W * 0.3, baseY - 245, 140, 265);
    ctx.fillRect(W * 0.52, baseY - 125, 85, 145);
    ctx.fillRect(W * 0.7, baseY - 210, 110, 230);

    ctx.beginPath();
    ctx.moveTo(W * 0.3, baseY - 245);
    ctx.lineTo(W * 0.36, baseY - 295);
    ctx.lineTo(W * 0.44, baseY - 230);
    ctx.lineTo(W * 0.5, baseY - 260);
    ctx.lineTo(W * 0.44, baseY - 245);
    ctx.fill();

    ctx.strokeStyle = "rgba(170,35,35,0.55)";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.46, baseY - 95);
    ctx.lineTo(W * 0.54, baseY - 35);
    ctx.stroke();
    ctx.fillStyle = "rgba(150,25,25,0.42)";
    ctx.beginPath();
    ctx.moveTo(W * 0.54, baseY - 35);
    ctx.lineTo(W * 0.62, baseY - 52);
    ctx.lineTo(W * 0.57, baseY - 15);
    ctx.fill();

    for (const e of embersFor(scene.id + "-ash")) {
      const life = (globalT * e.speed * 0.6 + e.phase) % 5;
      const y = e.y - life * 40;
      const a = clamp(1 - life / 5, 0, 1) * 0.35;
      ctx.beginPath();
      ctx.arc(e.x + Math.sin(globalT + e.phase) * 30, y, e.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,160,140,${a})`;
      ctx.fill();
    }

    vignette(ctx, 0.55);
    filmGrain(ctx, globalT, 0.035);
  }

  function visParticles(ctx, scene, localT, globalT) {
    fillGradient(ctx, scene.background?.gradient || ["#0c101c", "#05070c"]);
    drawDust(ctx, scene.id, globalT, 1);
    const rnd = seeded(42);
    for (let i = 0; i < 100; i++) {
      const px = (rnd() * W + globalT * 16 * (0.35 + rnd())) % W;
      const py = (rnd() * H + Math.sin(globalT * 0.8 + i) * 28) % H;
      const pr = 0.9 + rnd() * 2.8;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(175,210,255,${0.12 + rnd() * 0.4})`;
      ctx.fill();
    }
    vignette(ctx, 0.5);
    filmGrain(ctx, globalT, 0.025);
  }

  // ─── Main dispatcher ────────────────────────────────────────────
  function drawSceneBackground(ctx, scene, localT, globalT) {
    const type = scene.type || "sky";
    const id = scene.id || "";

    if (id === "bombardment" || id === "scene-fire") return visFire(ctx, scene, localT, globalT);
    if (id === "hook" || id === "closing" || id === "scene-intro") return visSky(ctx, scene, localT, globalT);
    if (id === "setting" || id === "scene-city") return visBuilding(ctx, scene, localT, globalT);
    if (id === "sultan-dies" || id === "scene-scholar") return visCharacter(ctx, scene, localT, globalT);
    if (id === "ultimatum") return visUltimatum(ctx, scene, localT, globalT);
    if (id === "britain-rejects") return visBritain(ctx, scene, localT, globalT);
    if (id === "thirty-eight") return visThirtyEight(ctx, scene, localT, globalT);
    if (id === "cost") return visCost(ctx, scene, localT, globalT);
    if (id === "title" || id === "year") return visText(ctx, scene, localT, globalT);

    switch (type) {
      case "sky": return visSky(ctx, scene, localT, globalT);
      case "building": return visBuilding(ctx, scene, localT, globalT);
      case "fire": return visFire(ctx, scene, localT, globalT);
      case "character": return visCharacter(ctx, scene, localT, globalT);
      case "text": return visText(ctx, scene, localT, globalT);
      case "particles": return visParticles(ctx, scene, localT, globalT);
      default:
        fillGradient(ctx, scene.background?.gradient || ["#0E1018", "#06070C"]);
        vignette(ctx, 0.5);
        filmGrain(ctx, globalT, 0.03);
    }
  }

  return {
    drawSceneBackground,
    fillGradient,
    vignette,
    filmGrain,
    drawStars,
    drawSea,
    drawPalace,
    drawShip,
    drawCrown,
    drawClock,
  };
}

module.exports = createVisuals;
