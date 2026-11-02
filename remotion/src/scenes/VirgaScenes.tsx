import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBg, Vignette, Parallax, Stars, Dust } from "../components/primitives";

type P = { gradient: string[]; localFrame: number; durationFrames: number };

const RainStreaks: React.FC<{ count?: number; evaporateAt?: number; speed?: number; opacity?: number }> = ({
  count = 50, evaporateAt = 1, speed = 1, opacity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drops = React.useMemo(() => {
    let s = 99;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: count }, () => ({
      x: rnd() * 100, delay: rnd() * 3, len: 18 + rnd() * 40, spd: 0.7 + rnd() * 1.1, thick: 1 + rnd() * 1.5,
    }));
  }, [count]);
  return (
    <Parallax depth={0.7}>
      {drops.map((d, i) => {
        const cycle = 2.2 / (d.spd * speed);
        const life = ((t * d.spd * speed + d.delay) % cycle) / cycle;
        const yStart = 8;
        const yEnd = 8 + evaporateAt * 78;
        const y = yStart + life * (yEnd - yStart);
        const fade = evaporateAt < 0.95
          ? (life > 0.55 ? Math.max(0, 1 - (life - 0.55) / 0.45) : 1)
          : (life > 0.85 ? Math.max(0, 1 - (life - 0.85) / 0.15) : 1);
        return (
          <div key={i} style={{
            position: "absolute", left: `${d.x}%`, top: `${y}%`, width: d.thick, height: d.len * fade, borderRadius: 2,
            background: `linear-gradient(180deg, rgba(180,210,255,${opacity * fade}), rgba(140,180,230,${0.15 * fade}))`, opacity: fade,
          }} />
        );
      })}
    </Parallax>
  );
};

const CloudBand: React.FC<{ y: number; depth?: number; scale?: number; alpha?: number }> = ({
  y, depth = 0.3, scale = 1, alpha = 0.55,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drift = Math.sin(t * 0.15 + y) * 12;
  return (
    <Parallax depth={depth}>
      <div style={{ position: "absolute", left: `calc(50% + ${drift}px)`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${scale})`, width: "120%", height: 120, opacity: alpha }}>
        {[-30, -10, 15, 35].map((ox, i) => (
          <div key={i} style={{
            position: "absolute", left: `${40 + ox}%`, top: i % 2 === 0 ? 10 : 30,
            width: 140 + i * 30, height: 70 + i * 12, borderRadius: "50%",
            background: `rgba(220,230,245,${0.35 + (i % 3) * 0.08})`, filter: "blur(2px)",
          }} />
        ))}
      </div>
    </Parallax>
  );
};

export const VirgaSkyRain: React.FC<P> = ({ gradient }) => (
  <AbsoluteFill>
    <GradientBg colors={gradient} />
    <Stars count={40} />
    <CloudBand y={18} depth={0.2} scale={1.1} alpha={0.7} />
    <CloudBand y={28} depth={0.35} scale={0.9} alpha={0.5} />
    <RainStreaks count={55} evaporateAt={0.55} speed={1.1} opacity={0.5} />
    <Dust count={30} />
    <Vignette strength={0.5} />
  </AbsoluteFill>
);

export const VirgaTitle: React.FC<P> = ({ gradient, localFrame }) => {
  const appear = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(localFrame, [8, 22], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Stars count={50} />
      <CloudBand y={20} depth={0.25} alpha={0.4} />
      <Parallax depth={0.4}>
        <div style={{
          position: "absolute", left: "50%", top: "42%",
          transform: `translate(-50%, -50%) scale(${0.9 + appear * 0.1})`, opacity: appear,
          color: "#E8F0FF", fontSize: 72, fontWeight: 700, fontFamily: "system-ui, sans-serif",
          letterSpacing: 12, textAlign: "center", textShadow: "0 0 40px rgba(140,180,255,0.4)",
        }}>VIRGA</div>
        <div style={{
          position: "absolute", left: "50%", top: "52%", width: `${lineW}%`, height: 2,
          background: "rgba(160,200,255,0.7)", transform: "translateX(-50%)",
          boxShadow: "0 0 16px rgba(140,180,255,0.5)",
        }} />
      </Parallax>
      <RainStreaks count={25} evaporateAt={0.45} opacity={0.25} />
      <Vignette />
    </AbsoluteFill>
  );
};

export const VirgaRainGround: React.FC<P> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <CloudBand y={16} depth={0.22} scale={1.15} alpha={0.65} />
      <RainStreaks count={70} evaporateAt={1} speed={1.2} opacity={0.6} />
      <Parallax depth={0.85}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "22%", background: "linear-gradient(180deg, rgba(20,40,60,0.3), rgba(10,20,30,0.9))" }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            position: "absolute", left: `${20 + i * 18}%`, bottom: `${8 + (i % 2) * 4}%`,
            width: 30 + i * 8, height: 4, borderRadius: "50%",
            background: `rgba(140,180,220,${0.12 + 0.08 * Math.sin(t * 3 + i)})`,
          }} />
        ))}
      </Parallax>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

export const VirgaDryAir: React.FC<P> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.3}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0, top: `${25 + i * 10}%`, height: 40,
            background: `linear-gradient(90deg, transparent, rgba(255,180,100,${0.04 + 0.03 * Math.sin(t + i)}), transparent)`,
            transform: `translateX(${Math.sin(t * 0.8 + i) * 20}px)`,
          }} />
        ))}
      </Parallax>
      <CloudBand y={14} depth={0.2} alpha={0.35} />
      <RainStreaks count={35} evaporateAt={0.4} speed={0.9} opacity={0.35} />
      <Parallax depth={0.75}>
        {Array.from({ length: 30 }).map((_, i) => {
          const x = ((i * 37 + t * 15) % 110) - 5;
          const y = 40 + ((i * 17) % 40) + Math.sin(t + i) * 3;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 2, height: 2, borderRadius: "50%", background: `rgba(255,200,140,${0.15 + 0.1 * Math.sin(t * 2 + i)})` }} />;
        })}
      </Parallax>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

export const VirgaEvaporate: React.FC<P> = ({ gradient, localFrame }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const intensity = interpolate(localFrame, [0, 20], [0.3, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <CloudBand y={15} depth={0.22} alpha={0.5} />
      <RainStreaks count={45} evaporateAt={0.42} speed={1} opacity={0.45 * intensity} />
      <Parallax depth={0.55}>
        {Array.from({ length: 20 }).map((_, i) => {
          const life = (t * 0.6 + i * 0.3) % 3;
          const y = 50 - life * 12;
          const a = Math.max(0, 1 - life / 3) * 0.25;
          return <div key={i} style={{ position: "absolute", left: `${15 + (i * 4) % 70}%`, top: `${y}%`, width: 40 + (i % 5) * 10, height: 20, borderRadius: "50%", background: `rgba(180,210,240,${a})`, filter: "blur(8px)" }} />;
        })}
      </Parallax>
      <Dust count={40} />
      <Vignette />
    </AbsoluteFill>
  );
};

export const VirgaCloud: React.FC<P> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Stars count={30} />
      <Parallax depth={0.25}>
        <div style={{ position: "absolute", left: "50%", top: "20%", transform: `translate(-50%, -50%) translateX(${Math.sin(t * 0.12) * 15}px)`, width: "90%", height: 140 }}>
          {[-25, -5, 20, 40].map((ox, i) => (
            <div key={i} style={{
              position: "absolute", left: `${42 + ox}%`, top: i % 2 === 0 ? 0 : 25,
              width: 160 + i * 25, height: 80 + i * 10, borderRadius: "50%",
              background: `rgba(210,220,235,${0.45 + i * 0.05})`, filter: "blur(1px)",
            }} />
          ))}
        </div>
      </Parallax>
      <Parallax depth={0.5}>
        {Array.from({ length: 35 }).map((_, i) => {
          const x = 25 + (i / 35) * 50 + Math.sin(t * 0.5 + i) * 2;
          const len = 120 + (i % 7) * 25;
          const sway = Math.sin(t * 1.2 + i * 0.4) * 8;
          return (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: "28%", width: 2, height: len,
              background: "linear-gradient(180deg, rgba(170,200,230,0.5), rgba(170,200,230,0.15) 60%, transparent)",
              transform: `rotate(${2 + sway * 0.3}deg) translateX(${sway}px)`, transformOrigin: "top center",
            }} />
          );
        })}
      </Parallax>
      <RainStreaks count={20} evaporateAt={0.5} speed={0.8} opacity={0.3} />
      <Vignette strength={0.48} />
    </AbsoluteFill>
  );
};

export const VirgaWind: React.FC<P> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.35}>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 15 + (i / 12) * 70;
          const phase = (t * 1.5 + i * 0.5) % 2.5;
          const y = 15 + phase * 30;
          const a = Math.max(0, 1 - phase / 2.5) * 0.2;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 3, height: 50 + (i % 4) * 15, borderRadius: 2, background: `linear-gradient(180deg, rgba(140,190,255,${a}), transparent)` }} />;
        })}
      </Parallax>
      <Parallax depth={0.8}>
        {Array.from({ length: 18 }).map((_, i) => {
          const y = 65 + (i % 6) * 5;
          const x = ((t * 40 * (0.8 + (i % 3) * 0.2) + i * 50) % 130) - 15;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 40 + (i % 4) * 15, height: 2, borderRadius: 1, background: `rgba(200,180,140,${0.15 + (i % 3) * 0.05})` }} />;
        })}
      </Parallax>
      <Dust count={50} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

export const VirgaDesert: React.FC<P> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.15}>
        <div style={{ position: "absolute", right: "18%", top: "14%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,80,0.45) 0%, rgba(255,140,40,0.1) 50%, transparent 70%)" }} />
      </Parallax>
      <CloudBand y={18} depth={0.22} alpha={0.3} />
      <RainStreaks count={30} evaporateAt={0.38} speed={0.85} opacity={0.35} />
      <Parallax depth={0.7}>
        <svg width="100%" height="35%" viewBox="0 0 1080 400" style={{ position: "absolute", left: 0, bottom: 0 }} preserveAspectRatio="none">
          <path d={`M0,250 Q200,${180 + Math.sin(t) * 8} 400,220 T800,200 T1080,240 L1080,400 L0,400 Z`} fill="#2a1c0e" />
          <path d={`M0,300 Q300,${240 + Math.sin(t * 0.8) * 6} 500,280 T1080,290 L1080,400 L0,400 Z`} fill="#1e140a" />
        </svg>
      </Parallax>
      <Dust count={45} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
