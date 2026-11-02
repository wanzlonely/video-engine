import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { GradientBg, Vignette, Parallax, Stars, Dust, useSceneOpacity } from "../components/primitives";

type P = { gradient: string[]; localFrame: number; durationFrames: number };

const RainStreaks: React.FC<{ count?: number; evaporateAt?: number; speed?: number; opacity?: number }> = ({
  count = 60, evaporateAt = 1, speed = 1, opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drops = React.useMemo(() => {
    let s = 99;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: count }, () => ({
      x: rnd() * 100, delay: rnd() * 4, len: 22 + rnd() * 48, spd: 0.55 + rnd() * 0.9,
      thick: 1.2 + rnd() * 1.4, sway: 0.3 + rnd() * 0.8,
    }));
  }, [count]);
  return (
    <Parallax depth={0.65}>
      {drops.map((d, i) => {
        const cycle = 2.8 / (d.spd * speed);
        const life = ((t * d.spd * speed + d.delay) % cycle) / cycle;
        const eased = life * life * (3 - 2 * life);
        const y = 6 + eased * (evaporateAt * 80);
        const swayX = Math.sin(t * 1.1 * d.sway + d.delay) * 3;
        let fade = 1;
        if (evaporateAt < 0.95) { const p = Math.max(0, (life - 0.5) / 0.5); fade = 1 - p * p; }
        else if (life > 0.88) fade = 1 - (life - 0.88) / 0.12;
        return (
          <div key={i} style={{
            position: "absolute", left: `calc(${d.x}% + ${swayX}px)`, top: `${y}%`,
            width: d.thick, height: Math.max(2, d.len * fade), borderRadius: 3,
            background: `linear-gradient(180deg, rgba(190,215,255,${opacity * fade}), rgba(150,190,240,${0.12 * fade}))`,
            opacity: Math.max(0, fade), transform: "rotate(4deg)",
          }} />
        );
      })}
    </Parallax>
  );
};

const CloudBand: React.FC<{ y: number; depth?: number; scale?: number; alpha?: number }> = ({
  y, depth = 0.28, scale = 1, alpha = 0.55,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drift = Math.sin(t * 0.1 + y * 0.1) * 18 + Math.sin(t * 0.04) * 8;
  return (
    <Parallax depth={depth}>
      <div style={{ position: "absolute", left: `calc(50% + ${drift}px)`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${scale})`, width: "130%", height: 140, opacity: alpha }}>
        {[-35, -12, 12, 38].map((ox, i) => (
          <div key={i} style={{
            position: "absolute", left: `${38 + ox}%`, top: 8 + (i % 2) * 22,
            width: 150 + i * 28, height: 72 + i * 14, borderRadius: "50%",
            background: `rgba(225,232,245,${0.32 + (i % 3) * 0.07})`, filter: "blur(3px)",
          }} />
        ))}
      </div>
    </Parallax>
  );
};

const FadeWrap: React.FC<P & { children: React.ReactNode }> = ({ localFrame, durationFrames, children }) => {
  const opacity = useSceneOpacity(localFrame, durationFrames, 16, 14);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const VirgaSkyRain: React.FC<P> = (props) => (
  <FadeWrap {...props}>
    <GradientBg colors={props.gradient} />
    <Stars count={45} />
    <CloudBand y={17} depth={0.18} scale={1.15} alpha={0.72} />
    <CloudBand y={27} depth={0.32} scale={0.95} alpha={0.5} />
    <RainStreaks count={65} evaporateAt={0.52} speed={0.95} opacity={0.48} />
    <Dust count={35} />
    <Vignette strength={0.48} />
  </FadeWrap>
);

export const VirgaTitle: React.FC<P> = (props) => {
  const appear = interpolate(props.localFrame, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lineW = interpolate(props.localFrame, [10, 28], [0, 42], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const yOff = interpolate(props.localFrame, [0, 18], [24, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <Stars count={55} />
      <CloudBand y={19} depth={0.22} alpha={0.38} />
      <Parallax depth={0.38}>
        <div style={{
          position: "absolute", left: "50%", top: `calc(42% + ${yOff}px)`,
          transform: `translate(-50%, -50%) scale(${0.92 + appear * 0.08})`, opacity: appear,
          color: "#EAF1FF", fontSize: 78, fontWeight: 700, fontFamily: "system-ui, sans-serif",
          letterSpacing: 14, textAlign: "center", textShadow: "0 0 48px rgba(140,190,255,0.45)",
        }}>VIRGA</div>
        <div style={{
          position: "absolute", left: "50%", top: "52%", width: `${lineW}%`, height: 2,
          background: "rgba(170,210,255,0.75)", transform: "translateX(-50%)",
          boxShadow: "0 0 20px rgba(140,190,255,0.55)", borderRadius: 2,
        }} />
      </Parallax>
      <RainStreaks count={28} evaporateAt={0.42} opacity={0.22} speed={0.85} />
      <Vignette />
    </FadeWrap>
  );
};

export const VirgaRainGround: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <CloudBand y={15} depth={0.2} scale={1.2} alpha={0.68} />
      <RainStreaks count={80} evaporateAt={1} speed={1.05} opacity={0.55} />
      <Parallax depth={0.82}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "24%", background: "linear-gradient(180deg, rgba(25,45,65,0.25), rgba(8,16,28,0.92))" }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            position: "absolute", left: `${15 + i * 16}%`, bottom: `${6 + (i % 3) * 3}%`,
            width: 28 + i * 6, height: 3, borderRadius: "50%",
            background: `rgba(150,190,230,${0.1 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2.2 + i))})`,
          }} />
        ))}
      </Parallax>
      <Vignette strength={0.42} />
    </FadeWrap>
  );
};

export const VirgaDryAir: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <Parallax depth={0.28}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0, top: `${22 + i * 9}%`, height: 36,
            background: `linear-gradient(90deg, transparent, rgba(255,185,110,${0.035 + 0.025 * Math.sin(t * 0.9 + i)}), transparent)`,
            transform: `translateX(${Math.sin(t * 0.55 + i * 0.7) * 28}px)`,
          }} />
        ))}
      </Parallax>
      <CloudBand y={13} depth={0.18} alpha={0.32} />
      <RainStreaks count={40} evaporateAt={0.38} speed={0.8} opacity={0.32} />
      <Dust count={30} />
      <Vignette strength={0.48} />
    </FadeWrap>
  );
};

export const VirgaEvaporate: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const intensity = interpolate(props.localFrame, [0, 22], [0.25, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <CloudBand y={14} depth={0.2} alpha={0.48} />
      <RainStreaks count={50} evaporateAt={0.4} speed={0.9} opacity={0.42 * intensity} />
      <Parallax depth={0.52}>
        {Array.from({ length: 22 }).map((_, i) => {
          const life = (t * 0.5 + i * 0.28) % 3.2;
          const y = 52 - life * 11;
          const a = Math.max(0, 1 - life / 3.2) * 0.28;
          return <div key={i} style={{
            position: "absolute", left: `${12 + ((i * 7) % 75)}%`, top: `${y}%`,
            width: 36 + (i % 5) * 12, height: 18, borderRadius: "50%",
            background: `rgba(185,215,245,${a})`, filter: "blur(10px)",
          }} />;
        })}
      </Parallax>
      <Dust count={45} />
      <Vignette />
    </FadeWrap>
  );
};

export const VirgaCloud: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <Stars count={35} />
      <Parallax depth={0.22}>
        <div style={{ position: "absolute", left: "50%", top: "19%", transform: `translate(-50%, -50%) translateX(${Math.sin(t * 0.1) * 20}px)`, width: "95%", height: 150 }}>
          {[-28, -8, 18, 42].map((ox, i) => (
            <div key={i} style={{
              position: "absolute", left: `${40 + ox}%`, top: (i % 2) * 22,
              width: 170 + i * 22, height: 85 + i * 12, borderRadius: "50%",
              background: `rgba(215,225,240,${0.42 + i * 0.05})`, filter: "blur(2px)",
            }} />
          ))}
        </div>
      </Parallax>
      <Parallax depth={0.48}>
        {Array.from({ length: 40 }).map((_, i) => {
          const x = 22 + (i / 40) * 56 + Math.sin(t * 0.35 + i * 0.3) * 2.5;
          const len = 130 + (i % 8) * 22;
          const sway = Math.sin(t * 0.9 + i * 0.35) * 10;
          return (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: "26%", width: 2.5, height: len,
              background: "linear-gradient(180deg, rgba(175,205,235,0.48), rgba(175,205,235,0.12) 55%, transparent)",
              transform: `rotate(${1.5 + sway * 0.25}deg) translateX(${sway}px)`, transformOrigin: "top center", borderRadius: 2,
            }} />
          );
        })}
      </Parallax>
      <RainStreaks count={22} evaporateAt={0.48} speed={0.75} opacity={0.28} />
      <Vignette strength={0.45} />
    </FadeWrap>
  );
};

export const VirgaWind: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <Parallax depth={0.32}>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 12 + (i / 14) * 76;
          const phase = (t * 1.2 + i * 0.45) % 2.8;
          const y = 12 + phase * 28;
          const a = Math.max(0, 1 - phase / 2.8) * 0.22;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 3, height: 55 + (i % 4) * 14, borderRadius: 2, background: `linear-gradient(180deg, rgba(145,195,255,${a}), transparent)` }} />;
        })}
      </Parallax>
      <Parallax depth={0.78}>
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 62 + (i % 7) * 4.5;
          const x = ((t * 35 * (0.75 + (i % 4) * 0.15) + i * 48) % 125) - 12;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 45 + (i % 5) * 14, height: 2, borderRadius: 1, background: `rgba(210,190,155,${0.12 + (i % 3) * 0.04})` }} />;
        })}
      </Parallax>
      <Dust count={55} />
      <Vignette strength={0.48} />
    </FadeWrap>
  );
};

export const VirgaDesert: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <GradientBg colors={props.gradient} />
      <Parallax depth={0.14}>
        <div style={{ position: "absolute", right: "16%", top: "12%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,205,90,0.42) 0%, rgba(255,145,45,0.1) 45%, transparent 70%)" }} />
      </Parallax>
      <CloudBand y={16} depth={0.2} alpha={0.28} />
      <RainStreaks count={32} evaporateAt={0.35} speed={0.8} opacity={0.32} />
      <Parallax depth={0.68}>
        <svg width="100%" height="36%" viewBox="0 0 1080 400" style={{ position: "absolute", left: 0, bottom: 0 }} preserveAspectRatio="none">
          <path d={`M0,245 Q220,${175 + Math.sin(t * 0.6) * 10} 420,215 T820,195 T1080,235 L1080,400 L0,400 Z`} fill="#2c1e10" />
          <path d={`M0,295 Q320,${235 + Math.sin(t * 0.5) * 7} 520,275 T1080,285 L1080,400 L0,400 Z`} fill="#1c140a" />
        </svg>
      </Parallax>
      <Dust count={50} />
      <Vignette strength={0.42} />
    </FadeWrap>
  );
};
