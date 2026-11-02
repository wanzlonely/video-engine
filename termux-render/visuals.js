/**
 * visuals.js — Dedicated visual effects engine driven by naskah data.
 *
 * RULE: Ketika naskah diganti, update registry atau helper di file ini
 * agar efek visual tetap premium dan selaras dengan konten baru.
 *
 * Setiap scene.type punya visualizer. Scene.id bisa override untuk
 * cerita spesifik (mis. "bombardment" → fire yang lebih ekstrem).
 */

function createVisuals(deps) {
  const {
    W, H, clamp, easeOutCubic, easeInOut, lerp, seeded,
    createCanvas,
  } = deps;

  function fillGradient(ctx, colors, y0 = 0, y1 = H) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    const list = Array.isArray(colors) ? colors : ["#0E1018", "#06070C"];
    list.forEach((c, i) => g.addColorStop(i / Math.max(1, list.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function vignette(ctx, strength = 0.55) {
    const v = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.12, W / 2, H * 0.5, H * 0.9);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  function filmGrain(ctx, t, amount = 0.035) {
    ctx.save();
    ctx.globalAlpha = amount;
    const rnd = seeded(Math.floor(t * 30) + 99);
    for (let i = 0; i < 180; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const s = 1 + rnd() * 2.2;
      ctx.fillStyle = rnd() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();
  }

  const starCache = new Map();
  const emberCache = new Map();

  function makeStars(count, seed) {
    const rnd = seeded(seed);
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rnd() * W,
        y: rnd() * H * 0.7,
        r: 0.5 + rnd() * 2.1,
        a: 0.22 + rnd() * 0.78,
        tw: rnd() * Math.PI * 2,
      });
    }
    return stars;
  }

  function makeEmbers(count, seed) {
    const rnd = seeded(seed);
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: W * 0.1 + rnd() * W * 0.8,
        y: H * 0.35 + rnd() * H * 0.4,
        r: 1.4 + rnd() * 7,
        speed: 0.3 + rnd() * 1.7,
        phase: rnd() * Math.PI * 2,
        hue: 8 + rnd() * 40,
      });
    }
    return list;
  }

  function starsFor(id) {
    if (!starCache.has(id)) {
      const seed = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 7);
      starCache.set(id, makeStars(140, seed));
    }
    return starCache.get(id);
  }

  function embersFor(id) {
    if (!emberCache.has(id)) {
      const seed = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 13);
      emberCache.set(id, makeEmbers(120, seed));
    }
    return emberCache.get(id);
  }

  function drawStars(ctx, id, t, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const st of starsFor(id)) {
      const tw = 0.35 + 0.65 * Math.sin(t * 2.3 + st.tw);
      const dx = Math.sin(t * 0.14 + st.tw) * 2.5;
      const dy = Math.cos(t * 0.11 + st.tw * 0.7) * 1.8;
      ctx.beginPath();
      ctx.arc(st.x + dx, st.y + dy, st.r * (0.85 + 0.28 * tw), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${st.a * tw})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function visSky(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#0A1020", "#04060C"];
    fillGradient(ctx, colors);
    drawStars(ctx, scene.id, globalT, 0.95);
    const g = ctx.createRadialGradient(W * 0.55, H * 0.28, 0, W * 0.55, H * 0.28, W * 0.55);
    g.addColorStop(0, "rgba(70,110,200,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W * 0.25 + Math.sin(globalT * 0.2) * 40, H * 0.55, 0, W * 0.25, H * 0.55, W * 0.4);
    g2.addColorStop(0, "rgba(100,60,160,0.08)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
    vignette(ctx, 0.52);
    filmGrain(ctx, globalT, 0.028);
  }

  function visBuilding(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#141C2E", "#05070C"];
    fillGradient(ctx, colors);
    const sun = ctx.createRadialGradient(W * 0.65, H * 0.32, 0, W * 0.65, H * 0.32, W * 0.55);
    sun.addColorStop(0, "rgba(255,150,70,0.18)");
    sun.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H);
    const baseY = H * 0.62;
    const sea = ctx.createLinearGradient(0, baseY, 0, H);
    sea.addColorStop(0, "#0c1a2e");
    sea.addColorStop(0.55, "#081018");
    sea.addColorStop(1, "#04060c");
    ctx.fillStyle = sea;
    ctx.fillRect(0, baseY, W, H - baseY);
    ctx.strokeStyle = "rgba(120,180,220,0.11)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = baseY + 14 + i * 26 + Math.sin(globalT * 1.5 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 36) {
        ctx.lineTo(x, y + Math.sin(x * 0.016 + globalT * 1.2 + i) * 6);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "#0a0e16";
    const blocks = [
      [0.08, 0.22, 0.28], [0.22, 0.14, 0.38], [0.38, 0.2, 0.32],
      [0.55, 0.16, 0.42], [0.72, 0.18, 0.3], [0.88, 0.12, 0.25],
    ];
    for (const [rx, rw, rh] of blocks) {
      const x = W * rx;
      const w = W * rw;
      const h = H * rh;
      ctx.fillRect(x, baseY - h, w, h + 4);
      ctx.fillStyle = "rgba(255,200,80,0.18)";
      for (let wy = baseY - h + 18; wy < baseY - 20; wy += 28) {
        for (let wx = x + 10; wx < x + w - 10; wx += 22) {
          if ((wx + wy) % 44 < 22) ctx.fillRect(wx, wy, 9, 12);
        }
      }
      ctx.fillStyle = "#0a0e16";
    }
    ctx.fillStyle = "rgba(255,220,120,0.06)";
    ctx.fillRect(W * 0.42, baseY - H * 0.38, W * 0.08, H * 0.38);
    vignette(ctx, 0.48);
    filmGrain(ctx, globalT, 0.03);
  }

  function visFire(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#1a0a06", "#2a1008", "#0c0604"];
    fillGradient(ctx, colors);
    function blast(cx, cy, t, power) {
      const pulse = 0.55 + 0.45 * Math.sin(t * 7.2);
      const rad = power * pulse;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, "rgba(255,240,180,0.5)");
      g.addColorStop(0.22, "rgba(255,140,40,0.32)");
      g.addColorStop(0.55, "rgba(255,40,10,0.14)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    blast(W * 0.5, H * 0.48, globalT, 300);
    blast(W * 0.32, H * 0.56, globalT * 1.25 + 0.8, 170);
    blast(W * 0.68, H * 0.52, globalT * 0.9 + 1.6, 190);
    for (const e of embersFor(scene.id)) {
      const life = (globalT * e.speed * 1.15 + e.phase) % 3.6;
      const y = e.y - life * 135;
      const a = clamp(1 - life / 3.6, 0, 1) * 0.95;
      const r = e.r * (0.7 + 0.42 * Math.sin(globalT * 5.5 + e.phase));
      const x = e.x + Math.sin(globalT * 2.3 + e.phase) * 24;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${e.hue},100%,58%,${a})`;
      ctx.fill();
      if (a > 0.35) {
        ctx.beginPath();
        ctx.arc(x, y + r * 2.4, r * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue + 18},100%,68%,${a * 0.45})`;
        ctx.fill();
      }
    }
    const baseY = H * 0.74;
    ctx.fillStyle = "rgba(8,4,4,0.95)";
    ctx.fillRect(W * 0.18, baseY - 190, 110, 210);
    ctx.fillRect(W * 0.38, baseY - 270, 150, 290);
    ctx.fillRect(W * 0.6, baseY - 160, 100, 180);
    const sea = ctx.createLinearGradient(0, baseY + 10, 0, H);
    sea.addColorStop(0, "#0c1a2e");
    sea.addColorStop(1, "#04060c");
    ctx.fillStyle = sea;
    ctx.fillRect(0, baseY + 10, W, H - baseY);
    vignette(ctx, 0.42);
    filmGrain(ctx, globalT, 0.04);
  }

  function visCharacter(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#2A2015", "#0C0906"];
    fillGradient(ctx, colors);
    const key = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, W * 0.55);
    key.addColorStop(0, "rgba(255,190,100,0.16)");
    key.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = key;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(20,14,8,0.75)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.82, W * 0.42, H * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(30,22,14,0.9)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.58, 70, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(W / 2 - 55, H * 0.62, 110, 160);
    vignette(ctx, 0.58);
    filmGrain(ctx, globalT, 0.03);
  }

  function visText(ctx, scene, localT, globalT) {
    const colors = scene.background?.gradient || ["#10162a", "#080b14", "#04060c"];
    fillGradient(ctx, colors);
    drawStars(ctx, scene.id, globalT, 0.35);
    const a = clamp(localT / 0.55, 0, 1);
    ctx.strokeStyle = `rgba(255,214,10,${0.65 * easeOutCubic(a)})`;
    ctx.lineWidth = 2.5;
    const lw = lerp(0, W * 0.32, easeOutCubic(a));
    ctx.beginPath();
    ctx.moveTo(W / 2 - lw, H * 0.52);
    ctx.lineTo(W / 2 + lw, H * 0.52);
    ctx.stroke();
    vignette(ctx, 0.55);
    filmGrain(ctx, globalT, 0.025);
  }

  function visParticles(ctx, scene, localT, globalT) {
    fillGradient(ctx, scene.background?.gradient || ["#0c101c", "#05070c"]);
    const rnd = seeded(42);
    for (let i = 0; i < 90; i++) {
      const px = (rnd() * W + globalT * 18 * (0.4 + rnd())) % W;
      const py = (rnd() * H + Math.sin(globalT + i) * 30) % H;
      const pr = 1 + rnd() * 3;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,255,${0.15 + rnd() * 0.45})`;
      ctx.fill();
    }
    vignette(ctx, 0.5);
  }

  function drawSceneBackground(ctx, scene, localT, globalT) {
    const type = scene.type || "sky";
    const id = scene.id || "";
    if (id === "bombardment" || id === "scene-fire") return visFire(ctx, scene, localT, globalT);
    if (id === "hook" || id === "closing" || id === "scene-intro") return visSky(ctx, scene, localT, globalT);
    if (id === "setting" || id === "scene-city") return visBuilding(ctx, scene, localT, globalT);
    if (id === "sultan-dies" || id === "scene-scholar") return visCharacter(ctx, scene, localT, globalT);
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
    }
  }

  return {
    drawSceneBackground,
    fillGradient,
    vignette,
    filmGrain,
  };
}

module.exports = createVisuals;
