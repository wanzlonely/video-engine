import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const GradientBg: React.FC<{ colors: string[] }> = ({ colors }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.join(", ")})` }} />
);

export const CinematicSky: React.FC<{ top?: string; mid?: string; bottom?: string; haze?: string }> = ({
  top = "#0a1224", mid = "#152238", bottom = "#1a1e28", haze = "rgba(120,160,220,0.07)",
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const breathe = 0.97 + 0.03 * Math.sin(t * 0.15);
  return (
    <AbsoluteFill style={{ transform: `scale(${breathe})`, transformOrigin: "50% 40%" }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 42%, ${bottom} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: "15%", height: "40%", background: `linear-gradient(180deg, transparent, ${haze})`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse 80% 70% at 50% 40%, transparent 8%, rgba(0,0,0,${strength * 0.45}) 70%, rgba(0,0,0,${strength * 0.9}) 100%)`,
    pointerEvents: "none",
  }} />
);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => {
  const frame = useCurrentFrame();
  const shift = (frame % 4) * 0.4;
  return (
    <AbsoluteFill style={{
      opacity, pointerEvents: "none",
      backgroundImage: `repeating-linear-gradient(${40 + shift}deg, rgba(255,255,255,0.025) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.025) 3px)`,
      mixBlendMode: "overlay",
    }} />
  );
};

export const Parallax: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth = 0.5, children, style,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x = Math.sin(t * 0.055) * 18 * depth + Math.sin(t * 0.13 + 1.7) * 5 * depth + Math.sin(t * 0.022 + 0.4) * 12 * depth;
  const y = Math.cos(t * 0.045) * 12 * depth + Math.sin(t * 0.095 + 0.9) * 4 * depth;
  const scale = 1 + Math.sin(t * 0.04) * 0.015 * depth;
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
    x: rnd() * 100, y: rnd() * 65, r: 0.35 + rnd() * 1.8, a: 0.1 + rnd() * 0.65, tw: rnd() * Math.PI * 2, spd: 0.25 + rnd() * 1.1,
  })), [count]);
  return (
    <Parallax depth={0.08}>
      {stars.map((st, i) => {
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.9 * st.spd + st.tw));
        return (
          <div key={i} style={{
            position: "absolute", left: `${st.x}%`, top: `${st.y}%`, width: st.r * 2, height: st.r * 2, borderRadius: "50%",
            background: `rgba(255,255,255,${st.a * tw})`,
            boxShadow: st.a > 0.5 ? `0 0 ${st.r * 5}px rgba(200,220,255,${st.a * tw * 0.3})` : undefined,
          }} />
        );
      })}
    </Parallax>
  );
};

export const Dust: React.FC<{ count?: number }> = ({ count = 50 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const particles = React.useMemo(() => seededList(42, count, (rnd) => ({
    x: rnd() * 100, y: rnd() * 100, r: 0.5 + rnd() * 2, speed: 3 + rnd() * 12, phase: rnd() * Math.PI * 2, a: 0.05 + rnd() * 0.16,
  })), [count]);
  return (
    <Parallax depth={0.8}>
      {particles.map((p, i) => {
        const x = (p.x + t * p.speed * 0.08 + Math.sin(t * 0.22 + p.phase) * 6) % 108;
        const y = (p.y + Math.sin(t * 0.28 + p.phase) * 7 + t * 1.2) % 100;
        return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: p.r * 2, height: p.r * 2, borderRadius: "50%", background: `rgba(200,220,255,${p.a})` }} />;
      })}
    </Parallax>
  );
};

export const Embers: React.FC<{ count?: number }> = ({ count = 45 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const list = React.useMemo(() => seededList(13, count, (rnd) => ({
    x: 5 + rnd() * 90, y: 42 + rnd() * 35, r: 1 + rnd() * 3.5, speed: 0.3 + rnd() * 1.2,
    phase: rnd() * Math.PI * 2, hue: 14 + rnd() * 28,
  })), [count]);
  return (
    <Parallax depth={0.85}>
      {list.map((e, i) => {
        const life = (t * e.speed * 1.05 + e.phase) % 4.2;
        const y = e.y - life * 14;
        const fade = Math.max(0, 1 - life / 4.2);
        const x = e.x + Math.sin(t * 1.2 + e.phase) * 2.5;
        const r = e.r * (0.75 + 0.3 * Math.sin(t * 2.8 + e.phase));
        return <div key={i} style={{
          position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: "50%",
          background: `hsla(${e.hue},95%,55%,${fade * fade * 0.8})`,
          boxShadow: `0 0 ${r * 4}px hsla(${e.hue},100%,58%,${fade * fade * 0.4})`,
        }} />;
      })}
    </Parallax>
  );
};

export const LightRays: React.FC<{ intensity?: number; color?: string }> = ({
  intensity = 0.09, color = "180,210,255",
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <Parallax depth={0.12}>
      {[0, 1, 2, 3].map((i) => {
        const ang = -14 + i * 10 + Math.sin(t * 0.12 + i) * 1.5;
        const a = intensity * (0.55 + 0.45 * Math.sin(t * 0.3 + i * 0.9));
        return (
          <div key={i} style={{
            position: "absolute", left: "28%", top: "-8%", width: 70 + i * 25, height: "80%",
            background: `linear-gradient(180deg, rgba(${color},${a}) 0%, rgba(${color},${a * 0.25}) 35%, transparent 75%)`,
            transform: `rotate(${ang}deg)`, transformOrigin: "top center", filter: "blur(12px)", pointerEvents: "none",
          }} />
        );
      })}
    </Parallax>
  );
};

export function useSceneOpacity(localFrame: number, durationFrames: number, fadeIn = 20, fadeOut = 18) {
  return Math.min(
    interpolate(localFrame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.2, 1) }),
    interpolate(localFrame, [durationFrames - fadeOut, durationFrames], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 1, 1),
    })
  );
}
