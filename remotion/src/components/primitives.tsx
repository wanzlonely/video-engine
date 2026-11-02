import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const GradientBg: React.FC<{ colors: string[] }> = ({ colors }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.join(", ")})` }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 40%, transparent 10%, rgba(0,0,0,${strength * 0.7}) 70%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

export const Parallax: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth = 0.5, children, style,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x = Math.sin(t * 0.09) * 14 * depth + Math.sin(t * 0.21 + 1.2) * 6 * depth + Math.sin(t * 0.04) * 10 * depth;
  const y = Math.cos(t * 0.07) * 10 * depth + Math.sin(t * 0.15 + 0.8) * 5 * depth;
  const scale = 1 + Math.sin(t * 0.06) * 0.018 * depth + Math.sin(t * 0.11) * 0.006 * depth;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`, willChange: "transform", ...style }}>
      {children}
    </div>
  );
};

function seededList<T>(seed: number, count: number, fn: (rnd: () => number, i: number) => T): T[] {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return Array.from({ length: count }, (_, i) => fn(rnd, i));
}

export const Stars: React.FC<{ count?: number }> = ({ count = 90 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const stars = React.useMemo(() => seededList(7, count, (rnd) => ({
    x: rnd() * 100, y: rnd() * 72, r: 0.5 + rnd() * 2.4, a: 0.15 + rnd() * 0.8, tw: rnd() * Math.PI * 2, spd: 0.5 + rnd() * 1.8,
  })), [count]);
  return (
    <Parallax depth={0.12}>
      {stars.map((st, i) => {
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.4 * st.spd + st.tw));
        const dx = Math.sin(t * 0.08 + st.tw) * 2;
        const dy = Math.cos(t * 0.06 + st.tw) * 1.5;
        return (
          <div key={i} style={{
            position: "absolute", left: `calc(${st.x}% + ${dx}px)`, top: `calc(${st.y}% + ${dy}px)`,
            width: st.r * 2 * (0.9 + 0.2 * tw), height: st.r * 2 * (0.9 + 0.2 * tw), borderRadius: "50%",
            background: `rgba(255,255,255,${st.a * tw})`,
            boxShadow: st.a > 0.6 ? `0 0 ${st.r * 5}px rgba(200,220,255,${st.a * tw * 0.35})` : undefined,
          }} />
        );
      })}
    </Parallax>
  );
};

export const Dust: React.FC<{ count?: number }> = ({ count = 55 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const particles = React.useMemo(() => seededList(42, count, (rnd) => ({
    x: rnd() * 100, y: rnd() * 100, r: 0.7 + rnd() * 2.2, speed: 6 + rnd() * 18, phase: rnd() * Math.PI * 2, a: 0.08 + rnd() * 0.22,
  })), [count]);
  return (
    <Parallax depth={0.85}>
      {particles.map((p, i) => {
        const x = (p.x + t * p.speed * 0.12 + Math.sin(t * 0.35 + p.phase) * 4) % 108;
        const y = (p.y + Math.sin(t * 0.4 + p.phase) * 5 + t * 2) % 100;
        return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: p.r * 2, height: p.r * 2, borderRadius: "50%", background: `rgba(210,225,255,${p.a})` }} />;
      })}
    </Parallax>
  );
};

export const Embers: React.FC<{ count?: number }> = ({ count = 55 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const list = React.useMemo(() => seededList(13, count, (rnd) => ({
    x: 5 + rnd() * 90, y: 35 + rnd() * 40, r: 1.2 + rnd() * 4.5, speed: 0.35 + rnd() * 1.5,
    phase: rnd() * Math.PI * 2, hue: 10 + rnd() * 35, drift: 12 + rnd() * 28,
  })), [count]);
  return (
    <Parallax depth={0.88}>
      {list.map((e, i) => {
        const life = (t * e.speed * 1.1 + e.phase) % 4;
        const y = e.y - life * 16;
        const fade = Math.max(0, 1 - life / 4);
        const x = e.x + Math.sin(t * 1.6 + e.phase) * (e.drift / 12);
        const r = e.r * (0.7 + 0.4 * Math.sin(t * 4 + e.phase));
        return <div key={i} style={{
          position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: "50%",
          background: `hsla(${e.hue},100%,60%,${fade * fade * 0.9})`,
          boxShadow: `0 0 ${r * 4}px hsla(${e.hue},100%,65%,${fade * fade * 0.5})`,
        }} />;
      })}
    </Parallax>
  );
};

export function useSceneOpacity(localFrame: number, durationFrames: number, fadeIn = 14, fadeOut = 12) {
  return Math.min(
    interpolate(localFrame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
    interpolate(localFrame, [durationFrames - fadeOut, durationFrames], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
    })
  );
}
