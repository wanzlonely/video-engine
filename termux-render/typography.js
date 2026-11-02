/**
 * typography.js — Premium subtitle + scene text rendering.
 *
 * Subtitle strategy for comfortable reading:
 * - Prefer short phrases (2–5 words) over single words when possible.
 * - Soft fade-in / fade-out timed to cue length.
 * - Consistent bottom safe-area, high contrast, light plate.
 * - Sync visual weight with scene changes (slight scale on new phrase).
 */

module.exports = function createTypography(deps) {
  const { W, H, clamp, easeOutCubic, wrapText, roundRect, subtitles } = deps;

  function buildPhrases(raw) {
    if (!raw || !raw.length) return [];
    const phrases = [];
    let buf = [];
    let bufStart = 0;
    let bufEnd = 0;

    const flush = () => {
      if (!buf.length) return;
      phrases.push({
        text: buf.join(" "),
        start: bufStart,
        end: bufEnd,
      });
      buf = [];
    };

    for (let i = 0; i < raw.length; i++) {
      const s = raw[i];
      const text = String(s.text || "").trim();
      if (!text) continue;

      if (!buf.length) {
        buf = [text];
        bufStart = s.start;
        bufEnd = s.end;
        continue;
      }

      const gap = s.start - bufEnd;
      const currentDur = bufEnd - bufStart;
      const wordCount = buf.length;

      const shouldMerge =
        gap < 0.18 &&
        wordCount < 5 &&
        currentDur < 2.4 &&
        (s.end - bufStart) < 3.0;

      if (shouldMerge) {
        buf.push(text);
        bufEnd = s.end;
      } else {
        flush();
        buf = [text];
        bufStart = s.start;
        bufEnd = s.end;
      }
    }
    flush();
    return phrases;
  }

  const phrases = buildPhrases(subtitles);

  function drawSceneText() { /* no-op */ }

  function drawSubtitles(ctx, timeSec) {
    const active = phrases.filter((p) => timeSec >= p.start && timeSec < p.end);
    if (!active.length) return;

    const item = active[active.length - 1];
    const text = String(item.text || "").trim();
    if (!text) return;

    const cueLen = Math.max(0.25, item.end - item.start);
    const fade = clamp(cueLen * 0.22, 0.18, 0.32);

    let alpha = 1;
    if (timeSec < item.start + fade) {
      alpha = easeOutCubic((timeSec - item.start) / fade);
    } else if (timeSec > item.end - fade) {
      alpha = easeOutCubic((item.end - timeSec) / fade);
    }
    alpha = clamp(alpha, 0, 1);
    if (alpha < 0.03) return;

    const progress = clamp((timeSec - item.start) / Math.max(0.01, cueLen), 0, 1);
    const scale = 0.96 + 0.04 * easeOutCubic(Math.min(1, progress * 3.5));

    const fontSize = 42;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = wrapText(ctx, text, W * 0.78).slice(0, 2);
    const lineH = fontSize * 1.32;
    const textW = Math.max(...lines.map((l) => ctx.measureText(l).width), 0);
    const padX = 36;
    const padY = 18;
    const bw = Math.min(W * 0.88, Math.max(textW + padX * 2, 180));
    const bh = lines.length * lineH + padY * 2;
    const bx = (W - bw) / 2;
    const by = H * 0.855 - bh / 2;

    const vg = ctx.createLinearGradient(0, H * 0.76, 0, H);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(0.55, "rgba(0,0,0,0.28)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, H * 0.76, W, H * 0.24);

    ctx.translate(W / 2, by + bh / 2);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -(by + bh / 2));

    ctx.fillStyle = "rgba(8,10,16,0.78)";
    roundRect(ctx, bx, by, bw, bh, 18);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, bx, by, bw, bh, 18);
    ctx.stroke();

    const cy = by + padY + lineH / 2;
    lines.forEach((ln, i) => {
      const y = cy + i * lineH;
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(ln, W / 2, y);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(ln, W / 2, y);
    });

    ctx.restore();
  }

  return {
    drawSceneText,
    drawSubtitles,
    phrases,
  };
};
