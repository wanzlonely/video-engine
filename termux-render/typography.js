/** Premium simple typography — works with any naskah */
module.exports = function createTypography(deps) {
  const { W, H, clamp, easeOutCubic, wrapText, roundRect, subtitles } = deps;

  // Headline disabled — narrative lives in subtitles only
  function drawSceneText() { /* no-op */ }

  function drawSubtitles(ctx, timeSec) {
    const active = subtitles
      .filter(function (s) { return timeSec >= s.start && timeSec < s.end; })
      .sort(function (a, b) { return a.start - b.start; });
    if (!active.length) return;

    const item = active[active.length - 1];
    const text = String(item.text || "").trim();
    if (!text) return;

    // Soft fade in/out within cue window
    const fade = Math.min(0.28, (item.end - item.start) * 0.22);
    let alpha = 1;
    if (timeSec < item.start + fade) {
      alpha = easeOutCubic((timeSec - item.start) / fade);
    } else if (timeSec > item.end - fade) {
      alpha = easeOutCubic((item.end - timeSec) / fade);
    }
    alpha = clamp(alpha, 0, 1);
    if (alpha < 0.02) return;

    const fontSize = 40;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "600 " + fontSize + "px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = wrapText(ctx, text, W * 0.78).slice(0, 2);
    const lineH = fontSize * 1.35;
    const textW = Math.max.apply(null, lines.map(function (l) { return ctx.measureText(l).width; }).concat([0]));
    const padX = 40;
    const padY = 20;
    const bw = Math.min(W * 0.9, Math.max(textW + padX * 2, 200));
    const bh = lines.length * lineH + padY * 2;
    const bx = (W - bw) / 2;
    const by = H * 0.86 - bh / 2;

    // Soft bottom vignette only (no heavy black bar)
    const vg = ctx.createLinearGradient(0, H * 0.78, 0, H);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, H * 0.78, W, H * 0.22);

    // Simple rounded plate
    ctx.fillStyle = "rgba(8,10,16,0.72)";
    roundRect(ctx, bx, by, bw, bh, 16);
    ctx.fill();

    // Thin light border
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1.25;
    roundRect(ctx, bx, by, bw, bh, 16);
    ctx.stroke();

    const cy = by + padY + lineH / 2;
    lines.forEach(function (ln, i) {
      const y = cy + i * lineH;
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.strokeText(ln, W / 2, y);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(ln, W / 2, y);
    });
    ctx.restore();
  }

  return { drawSceneText: drawSceneText, drawSubtitles: drawSubtitles };
};
