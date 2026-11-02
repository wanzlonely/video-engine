/**
 * visuals.js — Pure Code Motion Graphics Engine
 *
 * Semua visual dibuat dari kode (tanpa gambar).
 * Fokus: parallax, gerakan halus, mudah dibaca & diubah.
 */

function createVisuals(deps) {
  const { W, H, clamp, easeOutCubic, easeInOut, lerp, seeded } = deps;

  function fillGradient(ctx, colors) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    const list = Array.isArray(colors) ? colors : ["#0E1018", "#06070C"];
    list.forEach((c, i) => g.addColorStop(i / Math.max(1, list.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function vignette(ctx, strength = 0.5) {
    const v = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.1, W / 2, H * 0.5, H * 0.95);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  function filmGrain(ctx, t, amount = 0.028) {
    ctx.save();
    ctx.globalAlpha = amount;
    const rnd = seeded(Math.floor(t * 24) + 50);
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle = rnd() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    ctx.restore();
  }

  function layerTransform(ctx, t, parallax, opts = {}) {
    const amp = opts.amplitude ?? 16;
    const dx = Math.sin(t * 0.11 + (opts.phase || 0)) * amp * parallax;
    const dy = Math.cos(t * 0.08 + (opts.phase || 0) * 1.2) * amp * 0.5 * parallax;
    const kb = Math.sin(t * 0.04) * 0.5 + 0.5;
    const extraX = (kb - 0.5) * 30 * parallax;
    const extraY = Math.sin(t * 0.035) * 16 * parallax;
    const scale = (opts.scale || 1) * (1 + Math.sin(t * 0.07) * 0.006 * parallax);
    ctx.translate(W / 2 + dx + extraX, H / 2 + dy + extraY);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -H / 2);
  }

  const cache = { stars: new Map(), embers: new Map() };

  function getStars(id) {
    if (!cache.stars.has(id)) {
      const rnd = seeded(id.split("").reduce((a, c) => a + c.charCodeAt(0), 7));
      const list = [];
      for (let i = 0; i < 140; i++) {
        list.push({ x: rnd() * W * 1.2 - W * 0.1, y: rnd() * H * 0.65, r: 0.5 + rnd() * 2.2, a: 0.2 + rnd() * 0.75, tw: rnd() * Math.PI * 2 });
      }
      cache.stars.set(id, list);
    }
    return cache.stars.get(id);
  }

  function getEmbers(id) {
    if (!cache.embers.has(id)) {
      const rnd = seeded(id.split("").reduce((a, c) => a + c.charCodeAt(0), 13));
      const list = [];
      for (let i = 0; i < 110; i++) {
        list.push({ x: W * 0.08 + rnd() * W * 0.84, y: H * 0.35 + rnd() * H * 0.4, r: 1.2 + rnd() * 6.5, speed: 0.3 + rnd() * 1.7, phase: rnd() * Math.PI * 2, hue: 8 + rnd() * 40 });
      }
      cache.embers.set(id, list);
    }
    return cache.embers.get(id);
  }

  function drawStars(ctx, id, t, parallax = 0.15) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 10 });
    for (const s of getStars(id)) {
      const tw = 0.35 + 0.65 * Math.sin(t * 2.1 + s.tw);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.85 + 0.25 * tw), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawDust(ctx, id, t, parallax = 0.9) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 8 });
    const rnd = seeded(42);
    for (let i = 0; i < 60; i++) {
      const x = (rnd() * W + t * 12 * (0.4 + rnd())) % W;
      const y = (rnd() * H + Math.sin(t * 0.5 + i) * 20) % H;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + rnd() * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${0.1 + rnd() * 0.25})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSea(ctx, baseY, t, parallax = 0.75) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 9 });
    const sea = ctx.createLinearGradient(0, baseY, 0, H);
    sea.addColorStop(0, "#0b182c");
    sea.addColorStop(0.5, "#07121f");
    sea.addColorStop(1, "#03060c");
    ctx.fillStyle = sea;
    ctx.fillRect(-30, baseY - 10, W + 60, H - baseY + 30);
    ctx.strokeStyle = "rgba(120,180,230,0.12)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = baseY + 12 + i * 24 + Math.sin(t * 1.4 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(-20, y);
      for (let x = -20; x <= W + 20; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.015 + t * 1.2 + i) * 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPalace(ctx, cx, baseY, t, parallax = 0.55, damage = 0) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 12, scale: 1.02 });
    ctx.translate(cx, baseY);
    ctx.fillStyle = "#0a0e16";
    ctx.fillRect(-180, -220, 360, 225);
    ctx.fillRect(-205, -285, 70, 290);
    ctx.fillRect(135, -300, 70, 305);
    ctx.fillRect(-42, -340, 84, 345);
    ctx.beginPath(); ctx.arc(0, -340, 52, Math.PI, 0); ctx.fill();
    ctx.fillRect(-2.5, -420, 5, 85);
    if (damage < 0.5) {
      ctx.fillStyle = "rgba(255,195,70,0.22)";
      for (let y = -200; y < -30; y += 32)
        for (let x = -160; x < 160; x += 36)
          if ((x + y) % 72 < 36) ctx.fillRect(x, y, 12, 15);
    }
    if (damage > 0.2) {
      ctx.fillStyle = "rgba(8,4,4,0.9)";
      ctx.beginPath();
      ctx.moveTo(-70, -220); ctx.lineTo(-30, -280 - damage * 40); ctx.lineTo(20, -230);
      ctx.lineTo(60, -300 - damage * 30); ctx.lineTo(90, -220); ctx.fill();
    }
    ctx.restore();
  }

  function drawShip(ctx, x, y, t, scale = 0.85, parallax = 0.8) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 14 });
    ctx.translate(x, y + Math.sin(t * 1.5) * 3);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#0b1018";
    ctx.beginPath();
    ctx.moveTo(-120, 0); ctx.lineTo(-100, 36); ctx.lineTo(100, 36); ctx.lineTo(130, 0);
    ctx.lineTo(110, -14); ctx.lineTo(-90, -14); ctx.closePath(); ctx.fill();
    ctx.fillRect(-40, -55, 90, 45); ctx.fillRect(-20, -80, 42, 30);
    ctx.fillRect(-10, -115, 14, 40); ctx.fillRect(20, -108, 12, 35);
    const flash = 0.4 + 0.6 * Math.sin(t * 8.5 + x);
    if (flash > 0.8) {
      ctx.fillStyle = `rgba(255,180,60,${(flash - 0.8) * 2})`;
      ctx.beginPath(); ctx.arc(95, -5, 5 + flash * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "rgba(160,165,175,0.22)";
    for (let i = 0; i < 4; i++) {
      const sx = -3 + i * 9 + Math.sin(t * 1.7 + i) * 6;
      const sy = -125 - i * 15 - ((t * 20 + i * 11) % 45);
      ctx.beginPath(); ctx.arc(sx, sy, 7 + i * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawCrown(ctx, cx, cy, t, alpha = 1, parallax = 0.4) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 9 });
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy + Math.sin(t * 1.2) * 6);
    ctx.scale(1.6, 1.6);
    const g = ctx.createRadialGradient(0, -8, 0, 0, -8, 70);
    g.addColorStop(0, "rgba(255,200,60,0.28)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -8, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFD60A";
    ctx.beginPath();
    ctx.moveTo(-40, 18); ctx.lineTo(-32, -22); ctx.lineTo(-16, 4); ctx.lineTo(0, -34);
    ctx.lineTo(16, 4); ctx.lineTo(32, -22); ctx.lineTo(40, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#FF9F0A";
    ctx.beginPath(); ctx.arc(0, -34, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-32, -22, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(32, -22, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(-38, 15, 76, 10);
    ctx.restore();
  }

  function drawClock(ctx, cx, cy, progress, t, parallax = 0.35) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 8 });
    ctx.translate(cx, cy);
    const r = 120;
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    const g = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.3);
    g.addColorStop(0, `rgba(255,90,40,${0.12 + 0.1 * pulse})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,200,100,0.9)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 28), Math.sin(a) * (r - 28));
      ctx.lineTo(Math.cos(a) * (r - 12), Math.sin(a) * (r - 12));
      ctx.stroke();
    }
    const ang = -Math.PI / 2 + progress * Math.PI * 1.5;
    ctx.strokeStyle = "#FF453A"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * (r - 35), Math.sin(ang) * (r - 35)); ctx.stroke();
    ctx.fillStyle = "#FFD60A"; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFlag(ctx, x, y, t, color, parallax = 0.6) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 11 });
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(x - 3, y - 8, 6, 90);
    const w = 65, h = 40;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i <= 8; i++) ctx.lineTo(x + (i / 8) * w, y + Math.sin(t * 3 + i * 0.7) * 6 + (i / 8) * 2);
    for (let i = 8; i >= 0; i--) ctx.lineTo(x + (i / 8) * w, y + h + Math.sin(t * 3 + i * 0.7 + 0.4) * 5);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  }

  function drawBlast(ctx, cx, cy, t, power, parallax = 0.65) {
    ctx.save();
    layerTransform(ctx, t, parallax, { amplitude: 18 });
    const pulse = 0.55 + 0.45 * Math.sin(t * 7);
    const rad = power * pulse;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, "rgba(255,245,190,0.55)");
    g.addColorStop(0.2, "rgba(255,150,40,0.35)");
    g.addColorStop(0.5, "rgba(255,40,10,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function visSky(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#070b16", "#04060c", "#020308"]);
    drawStars(ctx, scene.id, t, 0.14);
    ctx.save();
    layerTransform(ctx, t, 0.28, { amplitude: 12 });
    const g = ctx.createRadialGradient(W * 0.55, H * 0.28, 0, W * 0.55, H * 0.28, W * 0.55);
    g.addColorStop(0, "rgba(60,100,190,0.16)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.restore();
    drawDust(ctx, scene.id, t, 0.85);
    vignette(ctx, 0.5); filmGrain(ctx, t);
  }

  function visBuilding(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#1a2840", "#0c1524", "#060a12"]);
    ctx.save();
    layerTransform(ctx, t, 0.18, { amplitude: 10 });
    const sun = ctx.createRadialGradient(W * 0.7, H * 0.25, 0, W * 0.7, H * 0.25, W * 0.5);
    sun.addColorStop(0, "rgba(255,155,70,0.22)"); sun.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sun; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.restore();
    const baseY = H * 0.58;
    drawSea(ctx, baseY, t, 0.72);
    drawPalace(ctx, W * 0.48, baseY, t, 0.55, 0);
    ctx.save();
    layerTransform(ctx, t, 0.9, { amplitude: 16 });
    ctx.fillStyle = "#080e16";
    ctx.beginPath();
    ctx.moveTo(40, baseY + 5); ctx.quadraticCurveTo(25, baseY - 160, 10, baseY - 250);
    ctx.quadraticCurveTo(80, baseY - 180, 100, baseY + 5); ctx.fill();
    ctx.restore();
    drawDust(ctx, scene.id, t, 0.9);
    vignette(ctx, 0.45); filmGrain(ctx, t);
  }

  function visFire(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#1a0a06", "#2a1008", "#0c0604"]);
    drawBlast(ctx, W * 0.5, H * 0.46, t, 300, 0.45);
    drawBlast(ctx, W * 0.33, H * 0.55, t * 1.2 + 1, 170, 0.6);
    drawBlast(ctx, W * 0.67, H * 0.5, t * 0.9 + 1.5, 190, 0.55);
    ctx.save();
    layerTransform(ctx, t, 0.88, { amplitude: 20 });
    for (const e of getEmbers(scene.id)) {
      const life = (t * e.speed * 1.15 + e.phase) % 3.6;
      const y = e.y - life * 140;
      const a = clamp(1 - life / 3.6, 0, 1) * 0.95;
      const r = e.r * (0.7 + 0.4 * Math.sin(t * 5.5 + e.phase));
      ctx.beginPath(); ctx.arc(e.x + Math.sin(t * 2 + e.phase) * 22, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${e.hue},100%,58%,${a})`; ctx.fill();
    }
    ctx.restore();
    const baseY = H * 0.72;
    ctx.save();
    layerTransform(ctx, t, 0.6, { amplitude: 12 });
    ctx.fillStyle = "rgba(8,4,4,0.95)";
    ctx.fillRect(W * 0.2, baseY - 200, 115, 220);
    ctx.fillRect(W * 0.4, baseY - 280, 160, 300);
    ctx.fillRect(W * 0.62, baseY - 170, 105, 190);
    ctx.restore();
    drawSea(ctx, baseY + 15, t, 0.75);
    drawShip(ctx, W * 0.18, baseY + 45, t, 0.88, 0.8);
    drawShip(ctx, W * 0.8, baseY + 58, t + 1.2, 0.72, 0.82);
    vignette(ctx, 0.4); filmGrain(ctx, t, 0.038);
  }

  function visCharacter(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#1a1220", "#0c0810", "#060408"]);
    const a = clamp(localT / 0.6, 0, 1);
    drawCrown(ctx, W / 2, H * 0.27, t, 0.92 * easeOutCubic(a), 0.35);
    ctx.save();
    layerTransform(ctx, t, 0.3, { amplitude: 8 });
    const g = ctx.createRadialGradient(W / 2, H * 0.28, 0, W / 2, H * 0.28, W * 0.5);
    g.addColorStop(0, "rgba(255,190,90,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.restore();
    ctx.save();
    layerTransform(ctx, t, 0.7, { amplitude: 10 });
    ctx.fillStyle = "rgba(20,15,22,0.92)";
    ctx.beginPath(); ctx.ellipse(W / 2, H * 0.78, W * 0.38, H * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(28,20,16,0.9)";
    ctx.beginPath(); ctx.ellipse(W / 2, H * 0.56, 75, 95, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(W / 2 - 60, H * 0.6, 120, 170);
    ctx.restore();
    vignette(ctx, 0.55); filmGrain(ctx, t);
  }

  function visText(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#10162a", "#080b14", "#04060c"]);
    drawStars(ctx, scene.id, t, 0.16);
    drawDust(ctx, scene.id, t, 0.8);
    const a = clamp(localT / 0.5, 0, 1);
    const e = easeOutCubic(a);
    ctx.save();
    layerTransform(ctx, t, 0.4, { amplitude: 7 });
    ctx.strokeStyle = `rgba(255,214,10,${0.7 * e})`; ctx.lineWidth = 2.8;
    const lw = lerp(0, W * 0.34, e);
    ctx.beginPath(); ctx.moveTo(W / 2 - lw, H * 0.52); ctx.lineTo(W / 2 + lw, H * 0.52); ctx.stroke();
    ctx.restore();
    vignette(ctx, 0.52); filmGrain(ctx, t, 0.024);
  }

  function visUltimatum(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#241810", "#100a08", "#080504"]);
    const progress = clamp(localT / (scene.duration || 8), 0, 1);
    drawClock(ctx, W / 2, H * 0.3, progress, t, 0.32);
    ctx.save();
    layerTransform(ctx, t, 0.75, { amplitude: 12 });
    const rnd = seeded(70);
    for (let i = 0; i < 35; i++) {
      const ang = rnd() * Math.PI * 2;
      const dist = 150 + rnd() * 110 + Math.sin(t * 2 + i) * 18;
      ctx.beginPath();
      ctx.arc(W / 2 + Math.cos(ang + t * 0.25) * dist, H * 0.3 + Math.sin(ang + t * 0.25) * dist * 0.65, 1 + rnd() * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,120,60,${0.08 + rnd() * 0.18})`; ctx.fill();
    }
    ctx.restore();
    vignette(ctx, 0.52); filmGrain(ctx, t);
  }

  function visBritain(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#14101c", "#0a0810", "#050408"]);
    drawStars(ctx, scene.id, t, 0.16);
    ctx.save();
    layerTransform(ctx, t, 0.4, { amplitude: 10 });
    ctx.fillStyle = "rgba(35,55,110,0.38)";
    ctx.beginPath(); ctx.moveTo(0, H * 0.32); ctx.lineTo(W * 0.44, H * 0.44); ctx.lineTo(W * 0.44, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = "rgba(115,65,28,0.32)";
    ctx.beginPath(); ctx.moveTo(W, H * 0.32); ctx.lineTo(W * 0.56, H * 0.44); ctx.lineTo(W * 0.56, H); ctx.lineTo(W, H); ctx.fill();
    ctx.restore();
    ctx.save();
    layerTransform(ctx, t, 0.55, { amplitude: 7 });
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.strokeStyle = `rgba(255,70,50,${0.3 + 0.25 * pulse})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.28); ctx.lineTo(W * 0.5, H * 0.78); ctx.stroke();
    ctx.restore();
    drawFlag(ctx, W * 0.17, H * 0.38, t, "#012169", 0.6);
    drawFlag(ctx, W * 0.72, H * 0.4, t + 1, "#c41e3a", 0.62);
    vignette(ctx, 0.48); filmGrain(ctx, t);
  }

  function visThirtyEight(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#0e121c", "#06080c"]);
    ctx.save();
    layerTransform(ctx, t, 0.3, { amplitude: 9 });
    const g = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 280);
    g.addColorStop(0, "rgba(255,214,10,0.13)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
    const a = 0.2 + 0.15 * Math.sin(t * 2.3);
    ctx.strokeStyle = `rgba(255,214,10,${a})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W / 2, H * 0.38, 150 + Math.sin(t * 1.4) * 5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    vignette(ctx, 0.48); filmGrain(ctx, t);
  }

  function visCost(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#12151c", "#080a0e"]);
    const baseY = H * 0.62;
    ctx.save();
    layerTransform(ctx, t, 0.55, { amplitude: 12 });
    ctx.fillStyle = "#0a0c12";
    ctx.fillRect(W * 0.12, baseY - 150, 90, 170);
    ctx.fillRect(W * 0.3, baseY - 240, 135, 260);
    ctx.fillRect(W * 0.52, baseY - 120, 80, 140);
    ctx.fillRect(W * 0.7, baseY - 200, 100, 220);
    ctx.beginPath();
    ctx.moveTo(W * 0.3, baseY - 240); ctx.lineTo(W * 0.36, baseY - 290); ctx.lineTo(W * 0.44, baseY - 225);
    ctx.lineTo(W * 0.5, baseY - 255); ctx.lineTo(W * 0.43, baseY - 240); ctx.fill();
    ctx.strokeStyle = "rgba(170,35,35,0.55)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(W * 0.46, baseY - 95); ctx.lineTo(W * 0.54, baseY - 35); ctx.stroke();
    ctx.restore();
    ctx.save();
    layerTransform(ctx, t, 0.9, { amplitude: 18 });
    for (const e of getEmbers(scene.id + "ash")) {
      const life = (t * e.speed * 0.5 + e.phase) % 5;
      const y = e.y - life * 40;
      const a = clamp(1 - life / 5, 0, 1) * 0.35;
      ctx.beginPath(); ctx.arc(e.x + Math.sin(t + e.phase) * 28, y, e.r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,160,140,${a})`; ctx.fill();
    }
    ctx.restore();
    vignette(ctx, 0.52); filmGrain(ctx, t, 0.032);
  }

  function drawSceneBackground(ctx, scene, localT, globalT) {
    const id = scene.id || "";
    const type = scene.type || "sky";
    if (id === "bombardment") return visFire(ctx, scene, localT, globalT);
    if (id === "hook" || id === "closing") return visSky(ctx, scene, localT, globalT);
    if (id === "setting") return visBuilding(ctx, scene, localT, globalT);
    if (id === "sultan-dies") return visCharacter(ctx, scene, localT, globalT);
    if (id === "ultimatum") return visUltimatum(ctx, scene, localT, globalT);
    if (id === "britain-rejects") return visBritain(ctx, scene, localT, globalT);
    if (id === "thirty-eight") return visThirtyEight(ctx, scene, localT, globalT);
    if (id === "cost") return visCost(ctx, scene, localT, globalT);
    if (id === "title" || id === "year") return visText(ctx, scene, localT, globalT);
    if (type === "fire") return visFire(ctx, scene, localT, globalT);
    if (type === "building") return visBuilding(ctx, scene, localT, globalT);
    if (type === "character") return visCharacter(ctx, scene, localT, globalT);
    if (type === "text") return visText(ctx, scene, localT, globalT);
    return visSky(ctx, scene, localT, globalT);
  }

  return { drawSceneBackground, fillGradient, vignette, filmGrain };
}

module.exports = createVisuals;
