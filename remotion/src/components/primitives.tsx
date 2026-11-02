import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const GradientBg: React.FC<{ colors: string[] }> = ({ colors }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.join(", ")})` }} />
);

export const CinematicSky: React.FC<{ top?: string; mid?: string; bottom?: string; haze?: string }> = ({
  top = "#0a1224", mid = "#152238", bottom = "#1a1e28", haze = "rgba(120,160,220,0.08)",
}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 45%, ${bottom} 100%)` }} />
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: "18%", height: "35%",
      background: `linear-gradient(180deg, transparent, ${haze})`, pointerEvents: "none",
    }} />
  </AbsoluteFill>
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse 75% 65% at 50% 42%, transparent 5%, rgba(0,0,0,${strength * 0.55}) 65%, rgba(0,0,0,${strength}) 100%)`,
    pointerEvents: "none",
  }} />
);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  const frame = useCurrentFrame();
  const o = (frame % 3) * 0.3;
  return (
    <AbsoluteFill style={{
      opacity, pointerEvents: "none",
      backgroundImage: `repeating-linear-gradient(${45 + o}deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 3px, rgba(0,0,0,0.03) 4px)`,
      mixBlendMode: "overlay",
    }} />
  );
};

export const Parallax: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth = 0.5, children, style,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x = Math.sin(t * 0.08) * 16 * depth + Math.sin(t * 0.19 + 1.1) * 7 * depth + Math.sin(t * 0.035) * 11 * depth;
  const y = Math.cos(t * 0.065) * 11 * depth + Math.sin(t * 0.14 + 0.7) * 5.5 * depth;
  const scale = 1 + Math.sin(t * 0.055) * 0.02 * depth;
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

export const Stars: React.FC<{ count?: number }> = ({ count = 100 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const stars = React.useMemo(() => seededList(7, count, (rnd) => ({
    x: rnd() * 100, y: rnd() * 68, r: 0.4 + rnd() * 2.2, a: 0.12 + rnd() * 0.75, tw: rnd() * Math.PI * 2, spd: 0.4 + rnd() * 1.6,
  })), [count]);
  return (
    <Parallax depth={0.1}>
      {stars.map((st, i) => {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.2 * st.spd + st.tw));
        return (
          <div key={i} style={{
            position: "absolute", left: `${st.x}%`, top: `${st.y}%`, width: st.r * 2, height: st.r * 2, borderRadius: "50%",
            background: `rgba(255,255,255,${st.a * tw})`,
            boxShadow: st.a > 0.55 ? `0 0 ${st.r * 6}px rgba(190,215,255,${st.a * tw * 0.4})` : undefined,
          }} />
        );
      })}
    </Parallax>
  );
};

export const Dust: React.FC<{ count?: number }> = ({ count = 60 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const particles = React.useMemo(() => seededList(42, count, (rnd) => ({
    x: rnd() * 100, y: rnd() * 100, r: 0.6 + rnd() * 2.4, speed: 5 + rnd() * 16, phase: rnd() * Math.PI * 2, a: 0.06 + rnd() * 0.2,
  })), [count]);
  return (
    <Parallax depth={0.82}>
      {particles.map((p, i) => {
        const x = (p.x + t * p.speed * 0.1 + Math.sin(t * 0.3 + p.phase) * 5) % 108;
        const y = (p.y + Math.sin(t * 0.35 + p.phase) * 6 + t * 1.8) % 100;
        return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: p.r * 2, height: p.r * 2, borderRadius: "50%", background: `rgba(200,220,255,${p.a})` }} />;
      })}
    </Parallax>
  );
};

export const Embers: React.FC<{ count?: number }> = ({ count = 50 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const list = React.useMemo(() => seededList(13, count, (rnd) => ({
    x: 5 + rnd() * 90, y: 40 + rnd() * 35, r: 1.2 + rnd() * 4, speed: 0.35 + rnd() * 1.4,
    phase: rnd() * Math.PI * 2, hue: 12 + rnd() * 30,
  })), [count]);
  return (
    <Parallax depth={0.88}>
      {list.map((e, i) => {
        const life = (t * e.speed * 1.1 + e.phase) % 4;
        const y = e.y - life * 15;
        const fade = Math.max(0, 1 - life / 4);
        const x = e.x + Math.sin(t * 1.5 + e.phase) * 2;
        const r = e.r * (0.7 + 0.35 * Math.sin(t * 3.5 + e.phase));
        return <div key={i} style={{
          position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: "50%",
          background: `hsla(${e.hue},100%,58%,${fade * fade * 0.85})`,
          boxShadow: `0 0 ${r * 5}px hsla(${e.hue},100%,60%,${fade * fade * 0.45})`,
        }} />;
      })}
    </Parallax>
  );
};

export const LightRays: React.FC<{ intensity?: number; color?: string }> = ({
  intensity = 0.12, color = "180,210,255",
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <Parallax depth={0.15}>
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = -18 + i * 9 + Math.sin(t * 0.15 + i) * 2;
        const a = intensity * (0.5 + 0.5 * Math.sin(t * 0.4 + i * 0.8));
        return (
          <div key={i} style={{
            position: "absolute", left: "30%", top: "-5%", width: 80 + i * 20, height: "85%",
            background: `linear-gradient(180deg, rgba(${color},${a}) 0%, rgba(${color},${a * 0.3}) 40%, transparent 80%)`,
            transform: `rotate(${ang}deg)`, transformOrigin: "top center", filter: "blur(8px)", pointerEvents: "none",
          }} />
        );
      })}
    </Parallax>
  );
};

export function useSceneOpacity(localFrame: number, durationFrames: number, fadeIn = 16, fadeOut = 14) {
  return Math.min(
    interpolate(localFrame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
    interpolate(localFrame, [durationFrames - fadeOut, durationFrames], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
    })
  );
}
