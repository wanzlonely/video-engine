import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import {
  CinematicSky, Vignette, Grain, Parallax, Stars, Dust, LightRays, useSceneOpacity,
} from "../components/primitives";

type P = { gradient: string[]; localFrame: number; durationFrames: number };

const FadeWrap: React.FC<P & { children: React.ReactNode }> = ({ localFrame, durationFrames, children }) => {
  const opacity = useSceneOpacity(localFrame, durationFrames, 18, 16);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const PremiumCloud: React.FC<{ cx: number; cy: number; scale?: number; alpha?: number; depth?: number; seed?: number }> = ({
  cx, cy, scale = 1, alpha = 0.7, depth = 0.22, seed = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drift = Math.sin(t * 0.09 + seed) * 14 + Math.sin(t * 0.04 + seed * 2) * 6;
  const puffs = React.useMemo(() => {
    let s = seed * 97;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: 9 }, () => ({
      ox: (rnd() - 0.5) * 55, oy: (rnd() - 0.5) * 28,
      w: 90 + rnd() * 120, h: 50 + rnd() * 70, a: 0.25 + rnd() * 0.4, blur: 4 + rnd() * 10,
    }));
  }, [seed]);
  return (
    <Parallax depth={depth}>
      <div style={{ position: "absolute", left: `calc(${cx}% + ${drift}px)`, top: `${cy}%`, transform: `translate(-50%, -50%) scale(${scale})`, width: 420, height: 220, opacity: alpha }}>
        {puffs.map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: `calc(50% + ${p.ox}%)`, top: `calc(50% + ${p.oy}%)`,
            width: p.w, height: p.h, borderRadius: "50%", transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse at 40% 40%, rgba(235,242,255,${p.a}), rgba(200,215,240,${p.a * 0.35}) 55%, transparent 75%)`,
            filter: `blur(${p.blur}px)`,
          }} />
        ))}
      </div>
    </Parallax>
  );
};

const VirgaCurtain: React.FC<{ evaporateAt?: number; density?: number; opacity?: number; speed?: number; yStart?: number }> = ({
  evaporateAt = 0.55, density = 70, opacity = 0.45, speed = 1, yStart = 22,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const streaks = React.useMemo(() => {
    let s = 55;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: density }, () => ({
      x: rnd() * 100, delay: rnd() * 5, len: 40 + rnd() * 90, spd: 0.4 + rnd() * 0.85,
      thick: 1.5 + rnd() * 2.2, sway: 0.4 + rnd() * 1.1, layer: rnd(),
    }));
  }, [density]);
  return (
    <Parallax depth={0.55}>
      {streaks.map((d, i) => {
        const cycle = 3.2 / (d.spd * speed);
        const life = ((t * d.spd * speed + d.delay) % cycle) / cycle;
        const eased = life * life * (3 - 2 * life);
        const y = yStart + eased * (evaporateAt * 70);
        const swayX = Math.sin(t * 0.9 * d.sway + d.delay) * (4 + d.layer * 6);
        let fade = 1;
        if (evaporateAt < 0.95) { const p = Math.max(0, (life - 0.45) / 0.55); fade = 1 - p * p; }
        else if (life > 0.9) fade = 1 - (life - 0.9) / 0.1;
        const depthA = 0.35 + d.layer * 0.65;
        const a = opacity * fade * depthA;
        return (
          <div key={i} style={{
            position: "absolute", left: `calc(${d.x}% + ${swayX}px)`, top: `${y}%`,
            width: d.thick * (0.6 + d.layer * 0.5), height: Math.max(3, d.len * fade * (0.7 + d.layer * 0.4)),
            borderRadius: 4,
            background: `linear-gradient(180deg, rgba(195,220,255,${a}) 0%, rgba(170,200,240,${a * 0.55}) 45%, rgba(150,185,230,${a * 0.1}) 100%)`,
            transform: `rotate(${3 + swayX * 0.15}deg)`, filter: d.layer < 0.35 ? "blur(0.8px)" : undefined,
          }} />
        );
      })}
    </Parallax>
  );
};

const FogBand: React.FC<{ y: number; height?: number; alpha?: number }> = ({ y, height = 18, alpha = 0.15 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const shift = Math.sin(t * 0.12) * 30;
  return (
    <Parallax depth={0.4}>
      <div style={{
        position: "absolute", left: -20, right: -20, top: `${y}%`, height: `${height}%`,
        background: `radial-gradient(ellipse 80% 60% at ${50 + shift * 0.1}% 50%, rgba(180,200,230,${alpha}), transparent 70%)`,
        filter: "blur(20px)", pointerEvents: "none",
      }} />
    </Parallax>
  );
};

export const VirgaSkyRain: React.FC<P> = (props) => (
  <FadeWrap {...props}>
    <CinematicSky top="#070e1c" mid="#121c32" bottom="#1a2230" haze="rgba(100,150,220,0.1)" />
    <Stars count={70} />
    <LightRays intensity={0.08} />
    <PremiumCloud cx={35} cy={16} scale={1.3} alpha={0.75} depth={0.15} seed={1} />
    <PremiumCloud cx={68} cy={20} scale={1.0} alpha={0.6} depth={0.22} seed={2} />
    <PremiumCloud cx={50} cy={12} scale={0.85} alpha={0.5} depth={0.12} seed={3} />
    <VirgaCurtain evaporateAt={0.5} density={85} opacity={0.42} speed={0.9} yStart={20} />
    <FogBand y={55} height={22} alpha={0.12} />
    <Dust count={40} />
    <Grain opacity={0.035} />
    <Vignette strength={0.55} />
  </FadeWrap>
);

export const VirgaTitle: React.FC<P> = (props) => {
  const appear = interpolate(props.localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lineW = interpolate(props.localFrame, [12, 32], [0, 48], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const yOff = interpolate(props.localFrame, [0, 20], [30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const glow = 0.3 + 0.2 * Math.sin(props.localFrame / 30);
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#060c18" mid="#0e1828" bottom="#141c28" />
      <Stars count={80} />
      <PremiumCloud cx={40} cy={18} scale={1.1} alpha={0.4} depth={0.18} seed={4} />
      <PremiumCloud cx={70} cy={22} scale={0.9} alpha={0.3} depth={0.25} seed={5} />
      <VirgaCurtain evaporateAt={0.4} density={40} opacity={0.2} speed={0.75} yStart={22} />
      <Parallax depth={0.35}>
        <div style={{ position: "absolute", left: "50%", top: `calc(40% + ${yOff}px)`, transform: `translate(-50%, -50%) scale(${0.9 + appear * 0.1})`, opacity: appear, textAlign: "center" }}>
          <div style={{ color: "#F0F6FF", fontSize: 86, fontWeight: 700, fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: 18, textShadow: `0 0 60px rgba(140,190,255,${0.5 + glow * 0.3}), 0 4px 30px rgba(0,0,0,0.5)` }}>VIRGA</div>
          <div style={{ margin: "18px auto 0", width: `${lineW}%`, height: 2, background: "linear-gradient(90deg, transparent, rgba(170,210,255,0.85), transparent)", boxShadow: "0 0 24px rgba(140,190,255,0.5)" }} />
          <div style={{ marginTop: 16, color: "rgba(200,220,245,0.7)", fontSize: 22, fontWeight: 500, letterSpacing: 4, opacity: appear * 0.85 }}>HUJAN YANG TAK PERNAH SAMPAI</div>
        </div>
      </Parallax>
      <Grain opacity={0.03} />
      <Vignette strength={0.6} />
    </FadeWrap>
  );
};

export const VirgaRainGround: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#0a1424" mid="#152030" bottom="#1a2838" haze="rgba(80,130,180,0.12)" />
      <PremiumCloud cx={30} cy={14} scale={1.25} alpha={0.7} depth={0.16} seed={6} />
      <PremiumCloud cx={65} cy={18} scale={1.1} alpha={0.55} depth={0.24} seed={7} />
      <VirgaCurtain evaporateAt={1} density={100} opacity={0.5} speed={1.05} yStart={16} />
      <Parallax depth={0.85}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "28%", background: "linear-gradient(180deg, rgba(15,30,50,0.15) 0%, rgba(8,18,32,0.85) 40%, #060e18 100%)" }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", left: `${10 + i * 15}%`, bottom: `${5 + (i % 3) * 4}%`, width: 40 + i * 10, height: 3, borderRadius: "50%", background: `rgba(160,200,240,${0.08 + 0.07 * (0.5 + 0.5 * Math.sin(t * 2 + i))})`, filter: "blur(1px)" }} />
        ))}
      </Parallax>
      <FogBand y={60} height={20} alpha={0.1} />
      <Grain opacity={0.03} />
      <Vignette strength={0.5} />
    </FadeWrap>
  );
};

export const VirgaDryAir: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#1a140e" mid="#2a2218" bottom="#1e1810" haze="rgba(255,180,100,0.06)" />
      <Parallax depth={0.25}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${20 + i * 8}%`, height: 32, background: `linear-gradient(90deg, transparent, rgba(255,190,120,${0.03 + 0.025 * Math.sin(t * 0.8 + i)}), transparent)`, transform: `translateX(${Math.sin(t * 0.5 + i * 0.6) * 35}px)`, filter: "blur(4px)" }} />
        ))}
      </Parallax>
      <PremiumCloud cx={45} cy={12} scale={1.0} alpha={0.35} depth={0.18} seed={8} />
      <VirgaCurtain evaporateAt={0.35} density={55} opacity={0.3} speed={0.75} yStart={18} />
      <Parallax depth={0.7}>
        {Array.from({ length: 40 }).map((_, i) => {
          const x = ((i * 43 + t * 14) % 115) - 8;
          const y = 35 + ((i * 21) % 45) + Math.sin(t * 0.7 + i) * 5;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 2.5, height: 2.5, borderRadius: "50%", background: `rgba(255,210,150,${0.1 + 0.1 * Math.sin(t * 1.4 + i)})` }} />;
        })}
      </Parallax>
      <Grain opacity={0.04} />
      <Vignette strength={0.52} />
    </FadeWrap>
  );
};

export const VirgaEvaporate: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const intensity = interpolate(props.localFrame, [0, 24], [0.3, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#0c1424" mid="#182438" bottom="#1a2230" />
      <PremiumCloud cx={40} cy={14} scale={1.2} alpha={0.55} depth={0.18} seed={9} />
      <PremiumCloud cx={72} cy={19} scale={0.95} alpha={0.4} depth={0.26} seed={10} />
      <VirgaCurtain evaporateAt={0.38} density={65} opacity={0.38 * intensity} speed={0.85} yStart={18} />
      <Parallax depth={0.5}>
        {Array.from({ length: 18 }).map((_, i) => {
          const life = (t * 0.45 + i * 0.35) % 3.5;
          const y = 48 - life * 10;
          const a = Math.max(0, 1 - life / 3.5) * 0.22 * intensity;
          const w = 50 + (i % 5) * 18;
          return <div key={i} style={{ position: "absolute", left: `${10 + ((i * 9) % 80)}%`, top: `${y}%`, width: w, height: w * 0.45, borderRadius: "50%", background: `rgba(180,210,245,${a})`, filter: "blur(14px)" }} />;
        })}
      </Parallax>
      <FogBand y={48} height={25} alpha={0.14} />
      <Dust count={50} />
      <Grain opacity={0.03} />
      <Vignette strength={0.5} />
    </FadeWrap>
  );
};

export const VirgaCloud: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#080e1a" mid="#121c2e" bottom="#181e2a" haze="rgba(90,140,200,0.08)" />
      <Stars count={50} />
      <LightRays intensity={0.06} color="160,195,240" />
      <PremiumCloud cx={50} cy={15} scale={1.5} alpha={0.85} depth={0.18} seed={11} />
      <PremiumCloud cx={32} cy={18} scale={1.1} alpha={0.55} depth={0.24} seed={12} />
      <PremiumCloud cx={72} cy={17} scale={1.05} alpha={0.5} depth={0.26} seed={13} />
      <Parallax depth={0.45}>
        {Array.from({ length: 55 }).map((_, i) => {
          const x = 18 + (i / 55) * 64 + Math.sin(t * 0.3 + i * 0.25) * 2;
          const len = 140 + (i % 9) * 28 + Math.sin(t * 0.5 + i) * 12;
          const sway = Math.sin(t * 0.75 + i * 0.3) * 12;
          const a = 0.25 + (i % 5) * 0.06;
          return (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: "24%", width: 2.5 + (i % 3) * 0.8, height: len, borderRadius: 3,
              background: `linear-gradient(180deg, rgba(175,205,235,${a * 0.9}) 0%, rgba(160,195,230,${a * 0.45}) 40%, rgba(150,185,220,${a * 0.12}) 70%, transparent 100%)`,
              transform: `rotate(${1.5 + sway * 0.2}deg) translateX(${sway}px)`, transformOrigin: "top center",
              filter: i % 4 === 0 ? "blur(1px)" : undefined,
            }} />
          );
        })}
      </Parallax>
      <VirgaCurtain evaporateAt={0.55} density={35} opacity={0.22} speed={0.7} yStart={28} />
      <FogBand y={58} height={25} alpha={0.12} />
      <Grain opacity={0.03} />
      <Vignette strength={0.52} />
    </FadeWrap>
  );
};

export const VirgaWind: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#16120e" mid="#241c14" bottom="#1a140e" haze="rgba(200,160,100,0.05)" />
      <Parallax depth={0.3}>
        {Array.from({ length: 16 }).map((_, i) => {
          const x = 10 + (i / 16) * 80;
          const phase = (t * 1.1 + i * 0.4) % 3;
          const y = 8 + phase * 25;
          const a = Math.max(0, 1 - phase / 3) * 0.18;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 4, height: 70 + (i % 5) * 18, borderRadius: 3, background: `linear-gradient(180deg, rgba(140,190,255,${a}), transparent)`, filter: "blur(2px)" }} />;
        })}
      </Parallax>
      <Parallax depth={0.75}>
        {Array.from({ length: 28 }).map((_, i) => {
          const y = 60 + (i % 8) * 4;
          const x = ((t * 38 * (0.7 + (i % 4) * 0.18) + i * 42) % 130) - 15;
          return <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 50 + (i % 5) * 18, height: 2, borderRadius: 1, background: `rgba(220,195,150,${0.1 + (i % 3) * 0.04})`, filter: "blur(0.5px)" }} />;
        })}
      </Parallax>
      <Dust count={65} />
      <Grain opacity={0.04} />
      <Vignette strength={0.5} />
    </FadeWrap>
  );
};

export const VirgaDesert: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#2a1e12" mid="#3a2a18" bottom="#2c2014" haze="rgba(255,180,80,0.08)" />
      <Parallax depth={0.12}>
        <div style={{ position: "absolute", right: "14%", top: "10%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,210,100,0.5) 0%, rgba(255,160,50,0.15) 40%, transparent 70%)" }} />
        <div style={{ position: "absolute", right: "18%", top: "14%", width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,230,160,0.7) 0%, rgba(255,190,80,0.3) 50%, transparent 70%)" }} />
      </Parallax>
      <PremiumCloud cx={40} cy={16} scale={1.0} alpha={0.3} depth={0.2} seed={14} />
      <VirgaCurtain evaporateAt={0.32} density={45} opacity={0.3} speed={0.75} yStart={18} />
      <Parallax depth={0.65}>
        <svg width="100%" height="40%" viewBox="0 0 1080 420" style={{ position: "absolute", left: 0, bottom: 0 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="dune1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a2a18" /><stop offset="100%" stopColor="#2a1c10" /></linearGradient>
            <linearGradient id="dune2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2c1e12" /><stop offset="100%" stopColor="#1a120a" /></linearGradient>
          </defs>
          <path d={`M0,240 Q200,${170 + Math.sin(t * 0.5) * 12} 400,210 T800,190 T1080,230 L1080,420 L0,420 Z`} fill="url(#dune1)" />
          <path d={`M0,300 Q300,${240 + Math.sin(t * 0.4) * 8} 520,280 T1080,290 L1080,420 L0,420 Z`} fill="url(#dune2)" />
        </svg>
      </Parallax>
      <Dust count={55} />
      <Grain opacity={0.04} />
      <Vignette strength={0.48} />
    </FadeWrap>
  );
};
