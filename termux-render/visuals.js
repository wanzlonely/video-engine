/**
 * visuals.js — Alive Motion Graphics Engine
 * Setiap frame harus terasa bergerak.
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
    const v = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.08, W / 2, H * 0.5, H * 0.95);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  function filmGrain(ctx, t, amount = 0.03) {
    ctx.save();
    ctx.globalAlpha = amount;
    const rnd = seeded(Math.floor(t * 28) + 40);
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = rnd() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(rnd() * W, rnd() * H, 0.8 + rnd() * 2.2, 0.8 + rnd() * 2.2);
    }
    ctx.restore();
  }

  function layer(ctx, t, depth, opts = {}) {
    const amp = opts.amp ?? 22;
    const spd = opts.spd ?? 0.14;
    const dx = Math.sin(t * spd + (opts.ph || 0)) * amp * depth;
    const dy = Math.cos(t * spd * 0.75 + (opts.ph || 0) * 1.3) * amp * 0.55 * depth;
    const kb = Math.sin(t * 0.05) * 0.5 + 0.5;
    const sx = (opts.scale || 1) * (1 + Math.sin(t * 0.08 + depth) * 0.012 * depth);
    ctx.translate(W / 2 + dx + (kb - 0.5) * 36 * depth, H / 2 + dy + Math.sin(t * 0.04) * 18 * depth);
    ctx.scale(sx, sx);
    ctx.translate(-W / 2, -H / 2);
  }

  const cache = { stars: new Map(), embers: new Map(), dust: new Map() };

  function hash(s) { return String(s).split("").reduce((a, c) => a + c.charCodeAt(0), 0); }

  function getStars(id) {
    if (!cache.stars.has(id)) {
      const rnd = seeded(hash(id) + 7);
      const list = [];
      for (let i = 0; i < 200; i++) list.push({ x: rnd() * W * 1.3 - W * 0.15, y: rnd() * H * 0.7, r: 0.4 + rnd() * 2.4, a: 0.15 + rnd() * 0.85, tw: rnd() * Math.PI * 2, spd: 0.8 + rnd() * 2.2 });
      cache.stars.set(id, list);
    }
    return cache.stars.get(id);
  }

  function getEmbers(id) {
    if (!cache.embers.has(id)) {
      const rnd = seeded(hash(id) + 13);
      const list = [];
      for (let i = 0; i < 160; i++) list.push({ x: W * 0.05 + rnd() * W * 0.9, y: H * 0.3 + rnd() * H * 0.45, r: 1 + rnd() * 7, speed: 0.35 + rnd() * 2.1, phase: rnd() * Math.PI * 2, hue: 5 + rnd() * 45, drift: 20 + rnd() * 35 });
      cache.embers.set(id, list);
    }
    return cache.embers.get(id);
  }

  function getDust(id) {
    if (!cache.dust.has(id)) {
      const rnd = seeded(hash(id) + 29);
      const list = [];
      for (let i = 0; i < 90; i++) list.push({ x: rnd() * W, y: rnd() * H, r: 0.6 + rnd() * 2.5, speed: 10 + rnd() * 28, phase: rnd() * Math.PI * 2, a: 0.08 + rnd() * 0.28 });
      cache.dust.set(id, list);
    }
    return cache.dust.get(id);
  }

  function drawStars(ctx, id, t, depth = 0.14) {
    ctx.save();
    layer(ctx, t, depth, { amp: 12, spd: 0.1 });
    for (const s of getStars(id)) {
      const tw = 0.25 + 0.75 * Math.sin(t * 2.4 * s.spd + s.tw);
      const dx = Math.sin(t * 0.15 + s.tw) * 3;
      const dy = Math.cos(t * 0.12 + s.tw) * 2;
      ctx.beginPath();
      ctx.arc(s.x + dx, s.y + dy, s.r * (0.8 + 0.35 * tw), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
      ctx.fill();
      if (s.a > 0.7 && tw > 0.7) {
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a * tw * 0.14})`;
        ctx.fill();
      }
    }
    const shoot = (t * 0.15) % 8;
    if (shoot < 0.9) {
      const p = shoot / 0.9;
      const sx = W * 0.1 + p * W * 0.9;
      const sy = H * 0.1 + p * H * 0.25 + Math.sin(t) * 30;
      ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 40, sy - 18); ctx.stroke();
    }
    ctx.restore();
  }

  function drawDust(ctx, id, t, depth = 0.9) {
    ctx.save();
    layer(ctx, t, depth, { amp: 10, spd: 0.12 });
    for (const p of getDust(id)) {
      const x = (p.x + t * p.speed * 0.4 + Math.sin(t * 0.4 + p.phase) * 16) % (W * 1.2);
      const y = (p.y + Math.sin(t * 0.55 + p.phase) * 22) % H;
      ctx.beginPath();
      ctx.arc(x < 0 ? x + W : x, y < 0 ? y + H : y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,225,255,${p.a})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEmbers(ctx, id, t, depth = 0.88) {
    ctx.save();
    layer(ctx, t, depth, { amp: 24, spd: 0.16 });
    for (const e of getEmbers(id)) {
      const life = (t * e.speed * 1.25 + e.phase) % 3.8;
      const y = e.y - life * 155;
      const a = clamp(1 - life / 3.8, 0, 1) * 0.96;
      const r = e.r * (0.65 + 0.5 * Math.sin(t * 6 + e.phase));
      const x = e.x + Math.sin(t * 2.3 + e.phase) * e.drift;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${e.hue},100%,58%,${a})`;
      ctx.fill();
      if (a > 0.35) {
        ctx.beginPath();
        ctx.arc(x, y + r * 2.4, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue + 15},100%,68%,${a * 0.5})`;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawSea(ctx, baseY, t, depth = 0.75) {
    ctx.save();
    layer(ctx, t, depth, { amp: 11, spd: 0.13 });
    const sea = ctx.createLinearGradient(0, baseY, 0, H);
    sea.addColorStop(0, "#0b182c"); sea.addColorStop(0.5, "#07121f"); sea.addColorStop(1, "#03060c");
    ctx.fillStyle = sea; ctx.fillRect(-40, baseY - 15, W + 80, H - baseY + 40);
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(120,185,230,${0.08 + (i % 3) * 0.03})`;
      ctx.lineWidth = 1.8 + (i % 2);
      const y0 = baseY + 8 + i * 20;
      ctx.beginPath(); ctx.moveTo(-30, y0);
      for (let x = -30; x <= W + 30; x += 22) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.014 + t * 1.6 + i * 0.9) * 7 + Math.sin(x * 0.03 + t * 2.1 + i) * 3.5);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPalace(ctx, cx, baseY, t, depth = 0.55, damage = 0) {
    ctx.save();
    layer(ctx, t, depth, { amp: 14, spd: 0.11, scale: 1.03 });
    ctx.translate(cx, baseY + Math.sin(t * 0.9) * 2);
    ctx.fillStyle = "#0a0e16";
    ctx.fillRect(-185, -225, 370, 230);
    ctx.fillRect(-210, -290, 72, 295);
    ctx.fillRect(138, -310, 72, 315);
    ctx.fillRect(-45, -350, 90, 355);
    ctx.beginPath(); ctx.arc(0, -350, 55, Math.PI, 0); ctx.fill();
    ctx.fillRect(-3, -430, 6, 85);
    if (damage < 0.5) {
      for (let y = -205; y < -30; y += 30)
        for (let x = -165; x < 165; x += 34)
          if ((x + y) % 68 < 34) {
            ctx.fillStyle = `rgba(255,195,70,${0.15 + 0.12 * Math.sin(t * 3.5 + x * 0.1 + y * 0.05)})`;
            ctx.fillRect(x, y, 12, 15);
          }
    }
    if (damage > 0.2) {
      ctx.fillStyle = "rgba(8,4,4,0.9)";
      ctx.beginPath();
      ctx.moveTo(-75, -225); ctx.lineTo(-30, -290 - damage * 45); ctx.lineTo(15, -240);
      ctx.lineTo(55, -315 - damage * 35); ctx.lineTo(95, -225); ctx.fill();
    }
    ctx.restore();
  }

  function drawShip(ctx, x, y, t, scale = 0.85, depth = 0.8) {
    ctx.save();
    layer(ctx, t, depth, { amp: 16, spd: 0.15 });
    const bob = Math.sin(t * 1.7 + x * 0.01) * 4;
    const roll = Math.sin(t * 1.1 + x * 0.02) * 0.03;
    ctx.translate(x, y + bob); ctx.rotate(roll); ctx.scale(scale, scale);
    ctx.fillStyle = "#0b1018";
    ctx.beginPath();
    ctx.moveTo(-125, 0); ctx.lineTo(-105, 38); ctx.lineTo(105, 38); ctx.lineTo(135, 0);
    ctx.lineTo(115, -16); ctx.lineTo(-95, -16); ctx.closePath(); ctx.fill();
    ctx.fillRect(-42, -58, 95, 48); ctx.fillRect(-22, -85, 48, 32);
    ctx.fillRect(-12, -122, 15, 42); ctx.fillRect(22, -115, 13, 36);
    const flash = 0.35 + 0.65 * Math.sin(t * 9.5 + x * 0.02);
    if (flash > 0.72) {
      ctx.fillStyle = `rgba(255,180,60,${(flash - 0.72) * 2.2})`;
      ctx.beginPath(); ctx.arc(98, -6, 5 + flash * 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "rgba(155,160,170,0.25)";
    for (let i = 0; i < 6; i++) {
      const life = (t * 1.8 + i * 0.7) % 3.2;
      ctx.beginPath();
      ctx.arc(-5 + i * 8 + Math.sin(t * 1.9 + i) * 9, -130 - life * 28, 6 + i * 1.8 + life * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCrown(ctx, cx, cy, t, alpha = 1, depth = 0.38) {
    ctx.save();
    layer(ctx, t, depth, { amp: 11, spd: 0.12 });
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy + Math.sin(t * 1.4) * 9);
    ctx.rotate(Math.sin(t * 0.7) * 0.04);
    ctx.scale(1.7, 1.7);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    const g = ctx.createRadialGradient(0, -8, 0, 0, -8, 75);
    g.addColorStop(0, `rgba(255,200,60,${0.22 + 0.15 * pulse})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -8, 75, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFD60A";
    ctx.beginPath();
    ctx.moveTo(-42, 18); ctx.lineTo(-34, -24); ctx.lineTo(-17, 4); ctx.lineTo(0, -36);
    ctx.lineTo(17, 4); ctx.lineTo(34, -24); ctx.lineTo(42, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#FF9F0A";
    ctx.beginPath(); ctx.arc(0, -36, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-34, -24, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(34, -24, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.32)"; ctx.fillRect(-40, 15, 80, 11);
    ctx.globalAlpha = alpha * 0.12 * pulse;
    ctx.strokeStyle = "#FFD60A"; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t * 0.3;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20 - 8); ctx.lineTo(Math.cos(a) * 90, Math.sin(a) * 90 - 8); ctx.stroke();
    }
    ctx.restore();
  }

  function drawClock(ctx, cx, cy, progress, t, depth = 0.34) {
    ctx.save();
    layer(ctx, t, depth, { amp: 9, spd: 0.1 });
    ctx.translate(cx, cy + Math.sin(t * 0.8) * 3);
    const r = 125;
    const pulse = 0.5 + 0.5 * Math.sin(t * 4.2);
    const g = ctx.createRadialGradient(0, 0, r * 0.25, 0, 0, r * 1.35);
    g.addColorStop(0, `rgba(255,90,40,${0.14 + 0.12 * pulse})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255,200,100,${0.85 + 0.15 * pulse})`; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 3.2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 30), Math.sin(a) * (r - 30));
      ctx.lineTo(Math.cos(a) * (r - 12), Math.sin(a) * (r - 12));
      ctx.stroke();
    }
    const ang = -Math.PI / 2 + progress * Math.PI * 1.55;
    ctx.strokeStyle = "#FF453A"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * (r - 38), Math.sin(ang) * (r - 38)); ctx.stroke();
    const secAng = -Math.PI / 2 + (t * 2.5) % (Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(secAng) * (r - 25), Math.sin(secAng) * (r - 25)); ctx.stroke();
    ctx.fillStyle = "#FFD60A"; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFlag(ctx, x, y, t, color, depth = 0.6) {
    ctx.save();
    layer(ctx, t, depth, { amp: 13, spd: 0.14 });
    ctx.translate(0, Math.sin(t * 1.3 + x) * 3);
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(x - 3.5, y - 10, 7, 95);
    const w = 70, h = 42;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i <= 10; i++) ctx.lineTo(x + (i / 10) * w, y + Math.sin(t * 3.5 + i * 0.65) * 8 + (i / 10) * 2.5 + Math.sin(t * 5.2 + i * 0.4) * 3);
    for (let i = 10; i >= 0; i--) ctx.lineTo(x + (i / 10) * w, y + h + Math.sin(t * 3.5 + i * 0.65 + 0.5) * 7 + Math.sin(t * 4.8 + i * 0.3) * 2.5);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  }

  function drawBlast(ctx, cx, cy, t, power, depth = 0.6, phase = 0) {
    ctx.save();
    layer(ctx, t, depth, { amp: 20, spd: 0.18 });
    const pulse = 0.5 + 0.5 * Math.sin(t * 7.5 + phase);
    const rad = power * pulse;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, "rgba(255,245,190,0.6)");
    g.addColorStop(0.18, "rgba(255,150,40,0.38)");
    g.addColorStop(0.45, "rgba(255,40,10,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function visSky(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#070b16", "#04060c", "#020308"]);
    drawStars(ctx, scene.id, t, 0.13);
    ctx.save();
    layer(ctx, t, 0.25, { amp: 16, spd: 0.09 });
    const g1 = ctx.createRadialGradient(W * 0.5 + Math.sin(t * 0.12) * 40, H * 0.28, 0, W * 0.5, H * 0.28, W * 0.55);
    g1.addColorStop(0, "rgba(60,100,190,0.17)"); g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1; ctx.fillRect(-30, -30, W + 60, H + 60);
    ctx.restore();
    drawDust(ctx, scene.id, t, 0.88);
    vignette(ctx, 0.5); filmGrain(ctx, t);
  }

  function visBuilding(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#1a2840", "#0c1524", "#060a12"]);
    ctx.save();
    layer(ctx, t, 0.16, { amp: 12, spd: 0.08 });
    const sun = ctx.createRadialGradient(W * 0.72, H * 0.24, 0, W * 0.72, H * 0.24, W * 0.52);
    sun.addColorStop(0, "rgba(255,155,70,0.24)"); sun.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sun; ctx.fillRect(-30, -30, W + 60, H + 60);
    ctx.restore();
    const baseY = H * 0.58;
    drawSea(ctx, baseY, t, 0.72);
    drawPalace(ctx, W * 0.48, baseY, t, 0.55, 0);
    ctx.save();
    layer(ctx, t, 0.65, { amp: 18, spd: 0.15 });
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 40 + i * 280) % (W + 100)) - 50;
      const by = H * 0.22 + Math.sin(t * 1.5 + i) * 25 + i * 18;
      const wing = Math.sin(t * 8 + i) * 6;
      ctx.strokeStyle = "rgba(20,25,35,0.5)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 8, by + wing); ctx.lineTo(bx, by); ctx.lineTo(bx + 8, by + wing); ctx.stroke();
    }
    ctx.restore();
    drawDust(ctx, scene.id, t, 0.92);
    vignette(ctx, 0.45); filmGrain(ctx, t);
  }

  function visFire(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#1a0a06", "#2a1008", "#0c0604"]);
    drawBlast(ctx, W * 0.5, H * 0.45, t, 310, 0.42, 0);
    drawBlast(ctx, W * 0.32, H * 0.54, t, 175, 0.58, 1.2);
    drawBlast(ctx, W * 0.68, H * 0.5, t, 195, 0.52, 2.4);
    drawBlast(ctx, W * 0.45, H * 0.6, t, 130, 0.68, 0.8);
    drawEmbers(ctx, scene.id, t, 0.9);
    const baseY = H * 0.72;
    ctx.save();
    layer(ctx, t, 0.62, { amp: 14, spd: 0.13 });
    ctx.fillStyle = "rgba(8,4,4,0.96)";
    ctx.fillRect(W * 0.18, baseY - 210, 120, 230);
    ctx.fillRect(W * 0.38, baseY - 290, 170, 310);
    ctx.fillRect(W * 0.6, baseY - 175, 110, 195);
    ctx.restore();
    drawSea(ctx, baseY + 18, t, 0.76);
    drawShip(ctx, W * 0.17, baseY + 48, t, 0.9, 0.8);
    drawShip(ctx, W * 0.81, baseY + 62, t + 1.4, 0.74, 0.83);
    vignette(ctx, 0.4); filmGrain(ctx, t, 0.04);
  }

  function visCharacter(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#1a1220", "#0c0810", "#060408"]);
    const a = clamp(localT / 0.55, 0, 1);
    drawCrown(ctx, W / 2, H * 0.26, t, 0.93 * easeOutCubic(a), 0.36);
    ctx.save();
    layer(ctx, t, 0.28, { amp: 10, spd: 0.1 });
    const g = ctx.createRadialGradient(W / 2, H * 0.27, 0, W / 2, H * 0.27, W * 0.5);
    g.addColorStop(0, "rgba(255,190,90,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(-25, -25, W + 50, H + 50);
    ctx.restore();
    ctx.save();
    layer(ctx, t, 0.72, { amp: 11, spd: 0.12 });
    ctx.fillStyle = "rgba(18,14,22,0.93)";
    ctx.beginPath(); ctx.ellipse(W / 2, H * 0.79, W * 0.4, H * 0.075, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(28,20,16,0.91)";
    ctx.beginPath(); ctx.ellipse(W / 2, H * 0.55, 80, 100, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(W / 2 - 64, H * 0.59, 128, 175);
    ctx.restore();
    vignette(ctx, 0.55); filmGrain(ctx, t);
  }

  function visText(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#10162a", "#080b14", "#04060c"]);
    drawStars(ctx, scene.id, t, 0.15);
    drawDust(ctx, scene.id, t, 0.82);
    const a = clamp(localT / 0.45, 0, 1);
    const e = easeOutCubic(a);
    ctx.save();
    layer(ctx, t, 0.38, { amp: 8, spd: 0.1 });
    ctx.strokeStyle = `rgba(255,214,10,${0.7 * e})`; ctx.lineWidth = 2.9;
    const lw = lerp(0, W * 0.36, e);
    ctx.beginPath(); ctx.moveTo(W / 2 - lw, H * 0.52); ctx.lineTo(W / 2 + lw, H * 0.52); ctx.stroke();
    ctx.restore();
    vignette(ctx, 0.52); filmGrain(ctx, t, 0.025);
  }

  function visUltimatum(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#241810", "#100a08", "#080504"]);
    const progress = clamp(localT / (scene.duration || 8), 0, 1);
    drawClock(ctx, W / 2, H * 0.29, progress, t, 0.32);
    ctx.save();
    layer(ctx, t, 0.78, { amp: 14, spd: 0.14 });
    for (let i = 0; i < 50; i++) {
      const ang = (i / 50) * Math.PI * 2 + t * 0.4;
      const dist = 140 + (i % 7) * 22 + Math.sin(t * 2.2 + i) * 25;
      ctx.beginPath();
      ctx.arc(W / 2 + Math.cos(ang) * dist, H * 0.29 + Math.sin(ang) * dist * 0.62, 1.2 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,120,60,${0.08 + 0.18 * Math.sin(t * 2.5 + i)})`; ctx.fill();
    }
    ctx.restore();
    vignette(ctx, 0.52); filmGrain(ctx, t);
  }

  function visBritain(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#14101c", "#0a0810", "#050408"]);
    drawStars(ctx, scene.id, t, 0.15);
    ctx.save();
    layer(ctx, t, 0.38, { amp: 12, spd: 0.11 });
    ctx.fillStyle = "rgba(35,55,110,0.4)";
    ctx.beginPath(); ctx.moveTo(0, H * 0.3); ctx.lineTo(W * 0.45, H * 0.43); ctx.lineTo(W * 0.45, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = "rgba(115,65,28,0.34)";
    ctx.beginPath(); ctx.moveTo(W, H * 0.3); ctx.lineTo(W * 0.55, H * 0.43); ctx.lineTo(W * 0.55, H); ctx.lineTo(W, H); ctx.fill();
    ctx.restore();
    ctx.save();
    layer(ctx, t, 0.55, { amp: 8, spd: 0.12 });
    const pulse = 0.4 + 0.6 * Math.sin(t * 3.5);
    ctx.strokeStyle = `rgba(255,70,50,${0.28 + 0.32 * pulse})`; ctx.lineWidth = 4.5 + pulse * 2;
    ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.26); ctx.lineTo(W * 0.5, H * 0.8); ctx.stroke();
    ctx.restore();
    drawFlag(ctx, W * 0.15, H * 0.36, t, "#012169", 0.6);
    drawFlag(ctx, W * 0.72, H * 0.39, t + 1.2, "#c41e3a", 0.62);
    drawDust(ctx, scene.id, t, 0.85);
    vignette(ctx, 0.48); filmGrain(ctx, t);
  }

  function visThirtyEight(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#0e121c", "#06080c"]);
    ctx.save();
    layer(ctx, t, 0.28, { amp: 10, spd: 0.1 });
    const g = ctx.createRadialGradient(W / 2, H * 0.37, 0, W / 2, H * 0.37, 300);
    g.addColorStop(0, "rgba(255,214,10,0.14)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(-30, -30, W + 60, H + 60);
    for (let i = 0; i < 3; i++) {
      const p = ((t * 0.7 + i * 0.9) % 2.8) / 2.8;
      ctx.strokeStyle = `rgba(255,214,10,${(1 - p) * 0.3})`; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.37, 140 + p * 120 + i * 20, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    drawStars(ctx, scene.id, t, 0.16);
    vignette(ctx, 0.48); filmGrain(ctx, t);
  }

  function visCost(ctx, scene, localT, t) {
    fillGradient(ctx, scene.background?.gradient || ["#12151c", "#080a0e"]);
    const baseY = H * 0.62;
    ctx.save();
    layer(ctx, t, 0.55, { amp: 13, spd: 0.12 });
    ctx.fillStyle = "#0a0c12";
    ctx.fillRect(W * 0.1, baseY - 155, 95, 175);
    ctx.fillRect(W * 0.28, baseY - 250, 145, 270);
    ctx.fillRect(W * 0.5, baseY - 125, 85, 145);
    ctx.fillRect(W * 0.68, baseY - 210, 115, 230);
    ctx.restore();
    drawEmbers(ctx, scene.id + "ash", t, 0.9);
    drawDust(ctx, scene.id, t, 0.88);
    vignette(ctx, 0.52); filmGrain(ctx, t, 0.034);
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
