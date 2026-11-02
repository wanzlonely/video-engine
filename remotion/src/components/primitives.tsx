import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const GradientBg: React.FC<{ colors: string[] }> = ({ colors }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.join(", ")})` }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 42%, transparent 0%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

export const Parallax: React.FC<{ depth?: number; children: React.ReactNode }> = ({
  depth = 0.5,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const amp = 22 * depth;
  const x = Math.sin(t * 0.14) * amp + Math.sin(t * 0.05) * 18 * depth;
  const y = Math.cos(t * 0.1) * amp * 0.5 + Math.sin(t * 0.04) * 12 * depth;
  const scale = 1 + Math.sin(t * 0.08) * 0.012 * depth;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${x}px, ${y}px) scale(${scale})` }}>
      {children}
    </div>
  );
};

function seededList(seed: number, count: number, fn: (rnd: () => number, i: number) => any) {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, (_, i) => fn(rnd, i));
}

export const Stars: React.FC<{ count?: number }> = ({ count = 80 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const stars = React.useMemo(
    () =>
      seededList(7, count, (rnd) => ({
        x: rnd() * 100,
        y: rnd() * 70,
        r: 0.5 + rnd() * 2.2,
        a: 0.2 + rnd() * 0.75,
        tw: rnd() * Math.PI * 2,
        spd: 0.8 + rnd() * 2,
      })),
    [count]
  );
  return (
    <Parallax depth={0.14}>
      {stars.map((st, i) => {
        const tw = 0.3 + 0.7 * Math.sin(t * 2.2 * st.spd + st.tw);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.r * 2 * (0.85 + 0.3 * tw),
              height: st.r * 2 * (0.85 + 0.3 * tw),
              borderRadius: "50%",
              background: `rgba(255,255,255,${st.a * tw})`,
            }}
          />
        );
      })}
    </Parallax>
  );
};

export const Dust: React.FC<{ count?: number }> = ({ count = 50 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const particles = React.useMemo(
    () =>
      seededList(42, count, (rnd) => ({
        x: rnd() * 100,
        y: rnd() * 100,
        r: 0.6 + rnd() * 2,
        speed: 8 + rnd() * 20,
        phase: rnd() * Math.PI * 2,
        a: 0.1 + rnd() * 0.25,
      })),
    [count]
  );
  return (
    <Parallax depth={0.9}>
      {particles.map((p, i) => {
        const x = (p.x + t * p.speed * 0.15 + Math.sin(t * 0.4 + p.phase) * 3) % 110;
        const y = (p.y + Math.sin(t * 0.5 + p.phase) * 4) % 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              background: `rgba(210,225,255,${p.a})`,
            }}
          />
        );
      })}
    </Parallax>
  );
};

export const Embers: React.FC<{ count?: number }> = ({ count = 60 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const list = React.useMemo(
    () =>
      seededList(13, count, (rnd) => ({
        x: 5 + rnd() * 90,
        y: 30 + rnd() * 45,
        r: 1 + rnd() * 5,
        speed: 0.4 + rnd() * 1.8,
        phase: rnd() * Math.PI * 2,
        hue: 8 + rnd() * 40,
        drift: 15 + rnd() * 30,
      })),
    [count]
  );
  return (
    <Parallax depth={0.88}>
      {list.map((e, i) => {
        const life = (t * e.speed * 1.2 + e.phase) % 3.6;
        const y = e.y - life * 18;
        const a = Math.max(0, 1 - life / 3.6) * 0.95;
        const x = e.x + Math.sin(t * 2 + e.phase) * (e.drift / 10);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: e.r * 2,
              height: e.r * 2,
              borderRadius: "50%",
              background: `hsla(${e.hue},100%,58%,${a})`,
              boxShadow: `0 0 ${e.r * 3}px hsla(${e.hue},100%,60%,${a * 0.6})`,
            }}
          />
        );
      })}
    </Parallax>
  );
};
