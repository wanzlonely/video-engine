/** Premium typography for video-engine */
module.exports = function createTypography(deps) {
  const { W, H, clamp, easeOutCubic, wrapText, roundRect, subtitles } = deps;

  function drawSceneText(ctx, scene, localT, duration, alphaMul) {
    if (!scene.text || !scene.text.content) return;
    const fadeIn = Math.min(duration * 0.22, 0.65);
    const fadeOut = Math.min(duration * 0.18, 0.55);
    let alpha = 1;
    if (localT < fadeIn) alpha = easeOutCubic(localT / fadeIn);
    else if (localT > duration - fadeOut) alpha = easeOutCubic((duration - localT) / fadeOut);
    alpha = clamp(alpha * alphaMul, 0, 1);
    if (alpha < 0.02) return;

    const raw = String(scene.text.content).split("\n").join(" · ");
    const label = raw.toUpperCase();
    const size = Math.min(34, (scene.text.size || 48) * 0.62);
    const yPct = 0.18;
    const cx = W / 2;
    const cy = H * yPct;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 " + size + "px system-ui, -apple-system, Segoe UI, sans-serif";

    const chars = label.split("");
    const gap = size * 0.12;
    let totalW = 0;
    const widths = chars.map(function (ch) {
      const w = ctx.measureText(ch).width + gap;
      totalW += w;
      return w;
    });
    totalW -= gap;

    const ruleW = Math.min(W * 0.28, totalW * 0.55);
    const ruleY1 = cy - size * 1.15;
    const ruleY2 = cy + size * 1.15;
    ctx.strokeStyle = "rgba(255,214,10,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - ruleW, ruleY1);
    ctx.lineTo(cx + ruleW, ruleY1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - ruleW * 0.7, ruleY2);
    ctx.lineTo(cx + ruleW * 0.7, ruleY2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,214,10,0.7)";
    [[-ruleW - 10, ruleY1], [ruleW + 10, ruleY1]].forEach(function (p) {
      const dx = p[0], dy = p[1];
      ctx.beginPath();
      ctx.moveTo(cx + dx, dy - 4);
      ctx.lineTo(cx + dx + 4, dy);
      ctx.lineTo(cx + dx, dy + 4);
      ctx.lineTo(cx + dx - 4, dy);
      ctx.closePath();
      ctx.fill();
    });

    let x = cx - totalW / 2;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      ctx.fillStyle = "rgba(255,200,60,0.25)";
      ctx.fillText(ch, x + widths[i] / 2 + 1, cy + 2);
      ctx.fillStyle = "#F5D76E";
      ctx.fillText(ch, x + widths[i] / 2, cy);
      x += widths[i];
    }
    ctx.restore();
  }

  function drawSubtitles(ctx, timeSec) {
    const active = subtitles
      .filter(function (s) { return timeSec >= s.start && timeSec < s.end; })
      .sort(function (a, b) { return a.start - b.start; });
    if (!active.length) return;

    const item = active[active.length - 1];
    const text = String(item.text || "").trim();
    if (!text) return;

    const mid = (item.start + item.end) / 2;
    const half = Math.max(0.05, (item.end - item.start) / 2);
    const dist = Math.abs(timeSec - mid);
    let alpha = 1;
    if (dist > half * 0.75) alpha = clamp(1 - (dist - half * 0.75) / (half * 0.25), 0, 1);

    const fontSize = 42;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "600 " + fontSize + "px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = wrapText(ctx, text, W * 0.76).slice(0, 2);
    const lineH = fontSize * 1.32;
    const textW = Math.max.apply(null, lines.map(function (l) { return ctx.measureText(l).width; }).concat([0]));
    const padX = 44;
    const padY = 22;
    const bw = Math.min(W * 0.92, Math.max(textW + padX * 2, 280));
    const bh = lines.length * lineH + padY * 2;
    const bx = (W - bw) / 2;
    const by = H * 0.88 - bh / 2;

    const vg = ctx.createLinearGradient(0, H * 0.72, 0, H);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(0.5, "rgba(0,0,0,0.35)");
    vg.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, H * 0.72, W, H * 0.28);

    ctx.fillStyle = "rgba(12,14,22,0.78)";
    roundRect(ctx, bx, by, bw, bh, 20);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,214,10,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 28, by + 1);
    ctx.lineTo(bx + bw - 28, by + 1);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, bx, by, bw, bh, 20);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,214,10,0.85)";
    roundRect(ctx, bx + 6, by + 14, 4, bh - 28, 2);
    ctx.fill();

    const cy = by + padY + lineH / 2;
    lines.forEach(function (ln, i) {
      const y = cy + i * lineH;
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(ln, W / 2, y);
      ctx.fillStyle = "#F7F3EA";
      ctx.fillText(ln, W / 2, y);
    });
    ctx.restore();
  }

  return { drawSceneText: drawSceneText, drawSubtitles: drawSubtitles };
};
