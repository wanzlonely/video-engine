import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import {
  CinematicSky, Vignette, Grain, Parallax, Stars, Dust, LightRays, useSceneOpacity,
} from "../components/primitives";

type P = { gradient: string[]; localFrame: number; durationFrames: number };

const FadeWrap: React.FC<P & { children: React.ReactNode }> = ({ localFrame, durationFrames, children }) => {
  const opacity = useSceneOpacity(localFrame, durationFrames, 22, 20);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const NaturalCloud: React.FC<{ cx: number; cy: number; scale?: number; alpha?: number; depth?: number; seed?: number }> = ({
  cx, cy, scale = 1, alpha = 0.65, depth = 0.2, seed = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const driftX = Math.sin(t * 0.06 + seed) * 16 + Math.sin(t * 0.025 + seed * 1.5) * 8;
  const driftY = Math.sin(t * 0.04 + seed * 0.7) * 4;
  const puffs = React.useMemo(() => {
    let s = seed * 113;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: 12 }, () => ({
      ox: (rnd() - 0.5) * 70, oy: (rnd() - 0.5) * 32,
      w: 70 + rnd() * 140, h: 40 + rnd() * 75, a: 0.18 + rnd() * 0.35, blur: 6 + rnd() * 14,
    }));
  }, [seed]);
  return (
    <Parallax depth={depth}>
      <div style={{ position: "absolute", left: `calc(${cx}% + ${driftX}px)`, top: `calc(${cy}% + ${driftY}px)`, transform: `translate(-50%, -50%) scale(${scale})`, width: 480, height: 240, opacity: alpha }}>
        {puffs.map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: `calc(50% + ${p.ox}%)`, top: `calc(50% + ${p.oy}%)`,
            width: p.w, height: p.h, borderRadius: "50%", transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse at 45% 40%, rgba(230,238,250,${p.a}) 0%, rgba(200,215,235,${p.a * 0.4}) 50%, transparent 72%)`,
            filter: `blur(${p.blur}px)`,
          }} />
        ))}
      </div>
    </Parallax>
  );
};

const NaturalRain: React.FC<{ evaporateAt?: number; density?: number; opacity?: number; speed?: number; yStart?: number }> = ({
  evaporateAt = 0.55, density = 75, opacity = 0.4, speed = 1, yStart = 20,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drops = React.useMemo(() => {
    let s = 71;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: density }, () => ({
      x: rnd() * 100, delay: rnd() * 6, len: 28 + rnd() * 100, spd: 0.35 + rnd() * 0.95,
      thick: 1.2 + rnd() * 2, sway: 0.3 + rnd() * 1.2, layer: rnd(), wind: (rnd() - 0.5) * 2,
    }));
  }, [density]);
  return (
    <Parallax depth={0.5}>
      {drops.map((d, i) => {
        const cycle = 3.6 / (d.spd * speed);
        const life = ((t * d.spd * speed + d.delay) % cycle) / cycle;
        const eased = life * life * (3 - 2 * life);
        const y = yStart + eased * (evaporateAt * 72);
        const swayX = Math.sin(t * 0.7 * d.sway + d.delay) * (3 + d.layer * 5) + d.wind * eased * 8;
        let fade = 1;
        if (evaporateAt < 0.95) { const p = Math.max(0, (life - 0.4) / 0.6); fade = 1 - p * p; }
        else if (life > 0.88) fade = 1 - (life - 0.88) / 0.12;
        const depthA = 0.3 + d.layer * 0.7;
        const a = opacity * fade * depthA;
        if (a < 0.02) return null;
        return (
          <div key={i} style={{
            position: "absolute", left: `calc(${d.x}% + ${swayX}px)`, top: `${y}%`,
            width: d.thick * (0.55 + d.layer * 0.55), height: Math.max(2, d.len * fade * (0.65 + d.layer * 0.4)),
            borderRadius: 3,
            background: `linear-gradient(180deg, rgba(195,218,250,${a}) 0%, rgba(170,200,235,${a * 0.5}) 50%, rgba(150,185,220,${a * 0.08}) 100%)`,
            transform: `rotate(${2.5 + swayX * 0.12 + d.wind}deg)`,
            filter: d.layer < 0.3 ? "blur(1px)" : undefined, opacity: Math.min(1, a * 2.2),
          }} />
        );
      })}
    </Parallax>
  );
};

const Mist: React.FC<{ y: number; h?: number; a?: number }> = ({ y, h = 20, a = 0.12 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const shift = Math.sin(t * 0.1) * 25;
  return (
    <Parallax depth={0.35}>
      <div style={{
        position: "absolute", left: -30, right: -30, top: `${y}%`, height: `${h}%`,
        background: `radial-gradient(ellipse 85% 55% at ${48 + shift * 0.08}% 50%, rgba(175,200,230,${a}), transparent 68%)`,
        filter: "blur(22px)", pointerEvents: "none",
      }} />
    </Parallax>
  );
};

export const VirgaSkyRain: React.FC<P> = (props) => (
  <FadeWrap {...props}>
    <CinematicSky top="#060d1a" mid="#101a2c" bottom="#181f2c" haze="rgba(90,140,200,0.09)" />
    <Stars count={60} /><LightRays intensity={0.06} />
    <NaturalCloud cx={32} cy={15} scale={1.35} alpha={0.7} depth={0.14} seed={1} />
    <NaturalCloud cx={70} cy={19} scale={1.05} alpha={0.55} depth={0.22} seed={2} />
    <NaturalCloud cx={52} cy={11} scale={0.9} alpha={0.45} depth={0.11} seed={3} />
    <NaturalRain evaporateAt={0.48} density={90} opacity={0.38} speed={0.85} yStart={18} />
    <Mist y={52} h={24} a={0.11} /><Dust count={35} /><Grain opacity={0.028} /><Vignette strength={0.52} />
  </FadeWrap>
);

export const VirgaTitle: React.FC<P> = (props) => {
  const appear = interpolate(props.localFrame, [0, 24], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  const lineW = interpolate(props.localFrame, [14, 36], [0, 44], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const yOff = interpolate(props.localFrame, [0, 24], [28, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  const glow = 0.35 + 0.15 * Math.sin(props.localFrame / 28);
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#050b16" mid="#0c1524" bottom="#121a26" />
      <Stars count={70} />
      <NaturalCloud cx={38} cy={17} scale={1.15} alpha={0.38} depth={0.16} seed={4} />
      <NaturalCloud cx={72} cy={21} scale={0.95} alpha={0.28} depth={0.24} seed={5} />
      <NaturalRain evaporateAt={0.38} density={35} opacity={0.18} speed={0.7} yStart={20} />
      <Parallax depth={0.3}>
        <div style={{ position: "absolute", left: "50%", top: `calc(40% + ${yOff}px)`, transform: `translate(-50%, -50%) scale(${0.94 + appear * 0.06})`, opacity: appear, textAlign: "center" }}>
          <div style={{ color: "#F2F7FF", fontSize: 84, fontWeight: 700, fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: 16, textShadow: `0 0 50px rgba(140,190,255,${0.4 + glow * 0.25}), 0 6px 28px rgba(0,0,0,0.45)` }}>VIRGA</div>
          <div style={{ margin: "16px auto 0", width: `${lineW}%`, height: 1.5, background: "linear-gradient(90deg, transparent, rgba(170,210,255,0.8), transparent)", boxShadow: "0 0 18px rgba(140,190,255,0.4)" }} />
          <div style={{ marginTop: 14, color: "rgba(195,215,240,0.65)", fontSize: 20, fontWeight: 500, letterSpacing: 3.5, opacity: appear * 0.9 }}>HUJAN YANG TAK PERNAH SAMPAI</div>
        </div>
      </Parallax>
      <Grain opacity={0.025} /><Vignette strength={0.58} />
    </FadeWrap>
  );
};

export const VirgaRainGround: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#081220" mid="#121e30" bottom="#182230" haze="rgba(70,120,170,0.1)" />
      <NaturalCloud cx={28} cy={13} scale={1.3} alpha={0.65} depth={0.15} seed={6} />
      <NaturalCloud cx={68} cy={17} scale={1.1} alpha={0.5} depth={0.23} seed={7} />
      <NaturalRain evaporateAt={1} density={110} opacity={0.45} speed={0.95} yStart={14} />
      <Parallax depth={0.82}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "30%", background: "linear-gradient(180deg, rgba(12,25,42,0.1) 0%, rgba(6,14,26,0.8) 35%, #040a12 100%)" }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", left: `${8 + i * 15}%`, bottom: `${4 + (i % 3) * 3.5}%`, width: 36 + i * 12, height: 2.5, borderRadius: "50%", background: `rgba(150,195,230,${0.06 + 0.06 * (0.5 + 0.5 * Math.sin(t * 1.6 + i))})`, filter: "blur(1.5px)" }} />
        ))}
      </Parallax>
      <Mist y={58} h={22} a={0.09} /><Grain opacity={0.025} /><Vignette strength={0.48} />
    </FadeWrap>
  );
};

export const VirgaDryAir: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#18120c" mid="#261e16" bottom="#1c1610" haze="rgba(255,175,95,0.05)" />
      <Parallax depth={0.22}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${22 + i * 8}%`, height: 28, background: `linear-gradient(90deg, transparent, rgba(255,185,110,${0.025 + 0.02 * Math.sin(t * 0.65 + i)}), transparent)`, transform: `translateX(${Math.sin(t * 0.4 + i * 0.55) * 40}px)`, filter: "blur(6px)" }} />
        ))}
      </Parallax>
      <NaturalCloud cx={48} cy={12} scale={1.05} alpha={0.3} depth={0.16} seed={8} />
      <NaturalRain evaporateAt={0.32} density={50} opacity={0.26} speed={0.7} yStart={16} />
      <Grain opacity={0.035} /><Vignette strength={0.5} />
    </FadeWrap>
  );
};

export const VirgaEvaporate: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const intensity = interpolate(props.localFrame, [0, 28], [0.25, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#0a1220" mid="#152030" bottom="#182028" />
      <NaturalCloud cx={38} cy={13} scale={1.25} alpha={0.5} depth={0.16} seed={9} />
      <NaturalCloud cx={70} cy={18} scale={0.95} alpha={0.38} depth={0.24} seed={10} />
      <NaturalRain evaporateAt={0.36} density={70} opacity={0.34 * intensity} speed={0.8} yStart={16} />
      <Parallax depth={0.48}>
        {Array.from({ length: 16 }).map((_, i) => {
          const life = (t * 0.38 + i * 0.4) % 3.8;
          const y = 50 - life * 9;
          const a = Math.max(0, 1 - life / 3.8) * 0.18 * intensity;
          const w = 55 + (i % 5) * 16;
          return <div key={i} style={{ position: "absolute", left: `${12 + ((i * 11) % 76)}%`, top: `${y}%`, width: w, height: w * 0.4, borderRadius: "50%", background: `rgba(175,205,240,${a})`, filter: "blur(16px)" }} />;
        })}
      </Parallax>
      <Mist y={46} h={26} a={0.12} /><Dust count={45} /><Grain opacity={0.025} /><Vignette strength={0.48} />
    </FadeWrap>
  );
};

export const VirgaCloud: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#070c18" mid="#101a2a" bottom="#161e28" haze="rgba(80,130,190,0.07)" />
      <Stars count={45} /><LightRays intensity={0.05} color="155,190,235" />
      <NaturalCloud cx={50} cy={14} scale={1.55} alpha={0.8} depth={0.16} seed={11} />
      <NaturalCloud cx={30} cy={17} scale={1.15} alpha={0.5} depth={0.22} seed={12} />
      <NaturalCloud cx={74} cy={16} scale={1.1} alpha={0.45} depth={0.25} seed={13} />
      <Parallax depth={0.42}>
        {Array.from({ length: 60 }).map((_, i) => {
          const nx = i / 60;
          const x = 16 + nx * 68 + Math.sin(t * 0.25 + i * 0.2) * 1.8;
          const centerBias = 1 - Math.abs(nx - 0.5) * 1.4;
          const len = (100 + (i % 8) * 22) * (0.7 + centerBias * 0.5);
          const sway = Math.sin(t * 0.6 + i * 0.28) * (8 + centerBias * 4);
          const a = (0.18 + (i % 4) * 0.05) * (0.6 + centerBias * 0.5);
          return (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: "22%", width: 2 + (i % 3) * 0.6,
              height: len + Math.sin(t * 0.4 + i) * 10, borderRadius: 3,
              background: `linear-gradient(180deg, rgba(170,200,230,${a}) 0%, rgba(155,190,225,${a * 0.4}) 45%, rgba(145,180,215,${a * 0.1}) 75%, transparent 100%)`,
              transform: `rotate(${1.2 + sway * 0.18}deg) translateX(${sway}px)`, transformOrigin: "top center",
              filter: i % 5 === 0 ? "blur(1.2px)" : undefined,
            }} />
          );
        })}
      </Parallax>
      <NaturalRain evaporateAt={0.5} density={30} opacity={0.18} speed={0.65} yStart={26} />
      <Mist y={55} h={26} a={0.11} /><Grain opacity={0.025} /><Vignette strength={0.5} />
    </FadeWrap>
  );
};

export const VirgaWind: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#14100c" mid="#201812" bottom="#18120e" haze="rgba(190,150,95,0.04)" />
      <Parallax depth={0.28}>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 12 + (i / 14) * 76;
          const phase = (t * 0.95 + i * 0.45) % 3.2;
          const y = 10 + phase * 22;
          const a = Math.max(0, 1 - phase / 3.2) * 0.15;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 3, height: 60 + (i % 4) * 16, borderRadius: 2, background: `linear-gradient(180deg, rgba(135,185,250,${a}), transparent)`, filter: "blur(2.5px)" }} />;
        })}
      </Parallax>
      <Parallax depth={0.72}>
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 62 + (i % 7) * 3.8;
          const x = ((t * 32 * (0.65 + (i % 4) * 0.16) + i * 40) % 125) - 12;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 48 + (i % 5) * 16, height: 1.5, borderRadius: 1, background: `rgba(215,190,145,${0.08 + (i % 3) * 0.035})`, filter: "blur(0.6px)" }} />;
        })}
      </Parallax>
      <Dust count={55} /><Grain opacity={0.03} /><Vignette strength={0.48} />
    </FadeWrap>
  );
};

export const VirgaDesert: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#261a10" mid="#342616" bottom="#281e12" haze="rgba(255,175,75,0.07)" />
      <Parallax depth={0.1}>
        <div style={{ position: "absolute", right: "12%", top: "9%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,205,95,0.45) 0%, rgba(255,155,50,0.12) 40%, transparent 68%)" }} />
        <div style={{ position: "absolute", right: "17%", top: "13%", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,225,150,0.65) 0%, rgba(255,185,80,0.25) 50%, transparent 70%)" }} />
      </Parallax>
      <NaturalCloud cx={42} cy={15} scale={1.0} alpha={0.28} depth={0.18} seed={14} />
      <NaturalRain evaporateAt={0.3} density={40} opacity={0.26} speed={0.7} yStart={16} />
      <Parallax depth={0.62}>
        <svg width="100%" height="42%" viewBox="0 0 1080 440" style={{ position: "absolute", left: 0, bottom: 0 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="d1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a2a16" /><stop offset="100%" stopColor="#281c0e" /></linearGradient>
            <linearGradient id="d2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a1e10" /><stop offset="100%" stopColor="#181008" /></linearGradient>
          </defs>
          <path d={`M0,250 Q220,${175 + Math.sin(t * 0.4) * 10} 420,220 T820,200 T1080,240 L1080,440 L0,440 Z`} fill="url(#d1)" />
          <path d={`M0,310 Q300,${250 + Math.sin(t * 0.35) * 7} 540,290 T1080,300 L1080,440 L0,440 Z`} fill="url(#d2)" />
        </svg>
      </Parallax>
      <Dust count={50} /><Grain opacity={0.03} /><Vignette strength={0.45} />
    </FadeWrap>
  );
};
