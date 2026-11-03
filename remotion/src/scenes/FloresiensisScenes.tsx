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

const JungleMist: React.FC<{ y?: number; a?: number }> = ({ y = 50, a = 0.14 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const shift = Math.sin(t * 0.09) * 22;
  return (
    <Parallax depth={0.4}>
      <div style={{
        position: "absolute", left: -40, right: -40, top: `${y}%`, height: "28%",
        background: `radial-gradient(ellipse 90% 50% at ${50 + shift * 0.1}% 50%, rgba(160,190,170,${a}), transparent 70%)`,
        filter: "blur(24px)", pointerEvents: "none",
      }} />
    </Parallax>
  );
};

const Hills: React.FC<{ color?: string; amp?: number }> = ({ color = "#0e1410", amp = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const w = Math.sin(t * 0.3) * 3 * amp;
  return (
    <Parallax depth={0.55}>
      <svg width="100%" height="50%" viewBox="0 0 1080 500" style={{ position: "absolute", left: 0, bottom: 0 }} preserveAspectRatio="none">
        <path d={`M0,${280 + w} Q180,${200 + w} 360,${250 + w} T720,${220 + w} T1080,${260 + w} L1080,500 L0,500 Z`} fill={color} />
      </svg>
    </Parallax>
  );
};

const HumanSilhouette: React.FC<{ x: number; bottom: number; height: number; opacity?: number; color?: string }> = ({
  x, bottom, height, opacity = 0.85, color = "#0a0c08",
}) => {
  const head = height * 0.16;
  const body = height * 0.38;
  const leg = height * 0.46;
  return (
    <div style={{ position: "absolute", left: `${x}%`, bottom: `${bottom}%`, width: height * 0.28, height, opacity, transform: "translateX(-50%)" }}>
      <div style={{ position: "absolute", left: "50%", top: 0, width: head, height: head, borderRadius: "50%", background: color, transform: "translateX(-50%)" }} />
      <div style={{ position: "absolute", left: "50%", top: head * 0.9, width: height * 0.18, height: body, borderRadius: 6, background: color, transform: "translateX(-50%)" }} />
      <div style={{ position: "absolute", left: "28%", top: head * 0.9 + body * 0.9, width: height * 0.07, height: leg, borderRadius: 4, background: color }} />
      <div style={{ position: "absolute", right: "28%", top: head * 0.9 + body * 0.9, width: height * 0.07, height: leg, borderRadius: 4, background: color }} />
    </div>
  );
};

export const AncientNight: React.FC<P> = (props) => (
  <FadeWrap {...props}>
    <CinematicSky top="#060a12" mid="#0e1420" bottom="#161c24" haze="rgba(80,100,140,0.06)" />
    <Stars count={110} />
    <Parallax depth={0.1}>
      <div style={{ position: "absolute", right: "18%", top: "12%", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,230,245,0.55) 0%, rgba(180,200,230,0.12) 45%, transparent 70%)" }} />
      <div style={{ position: "absolute", right: "20.5%", top: "14%", width: 70, height: 70, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,245,255,0.7) 0%, rgba(200,215,240,0.25) 55%, transparent 75%)" }} />
    </Parallax>
    <Hills color="#0a100e" amp={0.8} />
    <Hills color="#080c0a" amp={0.5} />
    <JungleMist y={48} a={0.1} /><Dust count={40} /><Grain opacity={0.03} /><Vignette strength={0.55} />
  </FadeWrap>
);

export const IslandScene: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#1a3040" mid="#2a4850" bottom="#3a5850" haze="rgba(100,180,200,0.08)" />
      <Parallax depth={0.12}>
        <div style={{ position: "absolute", left: "20%", top: "14%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,220,140,0.4) 0%, rgba(255,180,80,0.1) 40%, transparent 70%)" }} />
      </Parallax>
      <Parallax depth={0.7}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "38%", background: "linear-gradient(180deg, rgba(40,90,110,0.5) 0%, rgba(25,60,80,0.85) 40%, #122838 100%)" }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: `${12 + i * 5}%`, height: 2, background: `rgba(140,200,210,${0.06 + 0.04 * Math.sin(t * 1.2 + i)})`, transform: `translateX(${Math.sin(t * 0.6 + i) * 15}px)` }} />
        ))}
      </Parallax>
      <Parallax depth={0.5}>
        <svg width="100%" height="45%" viewBox="0 0 1080 450" style={{ position: "absolute", left: 0, bottom: "18%" }} preserveAspectRatio="none">
          <path d={`M80,400 Q200,${220 + Math.sin(t * 0.4) * 6} 350,280 T550,180 T750,260 T1000,380 L1000,450 L80,450 Z`} fill="#1a2e24" />
          <path d={`M120,400 Q280,${300 + Math.sin(t * 0.35) * 5} 400,320 T650,250 T900,380 L900,450 L120,450 Z`} fill="#142820" />
        </svg>
      </Parallax>
      <JungleMist y={42} a={0.12} /><Dust count={30} /><Grain opacity={0.028} /><Vignette strength={0.48} />
    </FadeWrap>
  );
};

export const SilhouetteScene: React.FC<P> = (props) => {
  const appear = interpolate(props.localFrame, [0, 25], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#141810" mid="#22281c" bottom="#1a2014" haze="rgba(120,140,100,0.06)" />
      <LightRays intensity={0.05} color="180,200,140" />
      <Hills color="#10140e" amp={0.6} /><JungleMist y={55} a={0.1} />
      <Parallax depth={0.45}>
        <div style={{ opacity: appear * 0.35 }}><HumanSilhouette x={38} bottom={12} height={340} color="#1a2214" /></div>
        <div style={{ opacity: appear }}><HumanSilhouette x={58} bottom={12} height={175} color="#0c1008" /></div>
        <div style={{ position: "absolute", left: "15%", right: "15%", bottom: "11%", height: 2, background: "rgba(40,50,30,0.5)", borderRadius: 1 }} />
      </Parallax>
      <Dust count={35} /><Grain opacity={0.03} /><Vignette strength={0.52} />
    </FadeWrap>
  );
};

export const TitleScene: React.FC<P> = (props) => {
  const appear = interpolate(props.localFrame, [0, 22], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  const yOff = interpolate(props.localFrame, [0, 22], [30, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  const lineW = interpolate(props.localFrame, [12, 32], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#0c1018" mid="#161c24" bottom="#12161c" /><Stars count={70} /><Hills color="#0a0e0c" amp={0.4} />
      <Parallax depth={0.3}>
        <div style={{ position: "absolute", left: "50%", top: `calc(42% + ${yOff}px)`, transform: `translate(-50%, -50%) scale(${0.94 + appear * 0.06})`, opacity: appear, textAlign: "center", width: "90%" }}>
          <div style={{ color: "rgba(200,215,200,0.7)", fontSize: 20, fontWeight: 500, letterSpacing: 5, marginBottom: 14 }}>MANUSIA PURBA</div>
          <div style={{ color: "#E8F0E8", fontSize: 48, fontWeight: 700, fontFamily: "Georgia, serif", fontStyle: "italic", letterSpacing: 2, textShadow: "0 0 40px rgba(140,180,140,0.35), 0 4px 24px rgba(0,0,0,0.5)" }}>Homo floresiensis</div>
          <div style={{ margin: "18px auto 0", width: `${lineW}%`, height: 1.5, background: "linear-gradient(90deg, transparent, rgba(160,200,160,0.7), transparent)" }} />
          <div style={{ marginTop: 16, color: "rgba(180,200,180,0.6)", fontSize: 22, letterSpacing: 2 }}>± 1 meter</div>
        </div>
      </Parallax>
      <Grain opacity={0.025} /><Vignette strength={0.58} />
    </FadeWrap>
  );
};

export const CaveScene: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const glow = 0.4 + 0.15 * Math.sin(t * 0.8);
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#080a0e" mid="#12100e" bottom="#0e0c0a" />
      <Parallax depth={0.35}>
        <div style={{ position: "absolute", left: "50%", top: "38%", transform: "translate(-50%, -50%)", width: "70%", height: "55%", borderRadius: "50% 50% 40% 40%", background: "radial-gradient(ellipse at 50% 40%, rgba(30,28,22,0.95) 0%, rgba(15,14,12,0.98) 50%, #0a0908 80%)", boxShadow: "inset 0 0 80px rgba(0,0,0,0.8)" }} />
        <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%, -50%)", width: "35%", height: "30%", borderRadius: "50%", background: `radial-gradient(circle, rgba(255,180,80,${glow * 0.2}) 0%, transparent 70%)`, filter: "blur(20px)" }} />
      </Parallax>
      <Parallax depth={0.5}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "22%", background: "linear-gradient(180deg, transparent, #0c0a08)" }} />
      </Parallax>
      <Dust count={45} /><Grain opacity={0.035} /><Vignette strength={0.6} />
    </FadeWrap>
  );
};

export const ToolsScene: React.FC<P> = (props) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const appear = interpolate(props.localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#141c12" mid="#1e2818" bottom="#182014" haze="rgba(100,130,80,0.05)" />
      <LightRays intensity={0.04} color="160,180,120" /><Hills color="#0e140c" amp={0.5} /><JungleMist y={52} a={0.1} />
      <Parallax depth={0.4}>
        {[{ x: 28, rot: -25, w: 50, h: 90 }, { x: 50, rot: 10, w: 40, h: 75 }, { x: 70, rot: -15, w: 55, h: 85 }].map((tool, i) => (
          <div key={i} style={{
            position: "absolute", left: `${tool.x}%`, top: "42%", width: tool.w, height: tool.h,
            opacity: appear * (0.7 + i * 0.1),
            transform: `translate(-50%, -50%) rotate(${tool.rot + Math.sin(t * 0.5 + i) * 2}deg)`,
            background: "linear-gradient(145deg, #5a5a50 0%, #3a3a32 40%, #2a2a24 100%)",
            borderRadius: "8px 20px 6px 18px", boxShadow: "2px 4px 12px rgba(0,0,0,0.4)",
          }} />
        ))}
      </Parallax>
      <Parallax depth={0.55}><div style={{ opacity: appear * 0.7 }}><HumanSilhouette x={50} bottom={14} height={140} color="#0a0e08" /></div></Parallax>
      <Dust count={40} /><Grain opacity={0.03} /><Vignette strength={0.5} />
    </FadeWrap>
  );
};

export const DwarfismScene: React.FC<P> = (props) => {
  const progress = interpolate(props.localFrame, [0, 50], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const figures = [1, 0.85, 0.7, 0.55, 0.42];
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#121820" mid="#1c2830" bottom="#182028" haze="rgba(80,120,150,0.06)" /><Stars count={40} />
      <Parallax depth={0.4}>
        {figures.map((scale, i) => {
          const reveal = interpolate(progress, [i * 0.15, i * 0.15 + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: reveal * (0.5 + scale * 0.4) }}>
              <HumanSilhouette x={15 + i * 17} bottom={14} height={280 * scale} color={i === figures.length - 1 ? "#0a100c" : "#141c18"} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: "8%", right: "8%", bottom: "12%", height: 2, background: "rgba(50,70,60,0.4)" }} />
        <div style={{ position: "absolute", left: "18%", right: "18%", bottom: "8%", height: 1, background: "linear-gradient(90deg, transparent, rgba(120,160,140,0.35), transparent)", opacity: progress }} />
      </Parallax>
      <Dust count={30} /><Grain opacity={0.028} /><Vignette strength={0.52} />
    </FadeWrap>
  );
};

export const ClosingScene: React.FC<P> = (props) => {
  const appear = interpolate(props.localFrame, [0, 30], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
  return (
    <FadeWrap {...props}>
      <CinematicSky top="#080c14" mid="#101820" bottom="#0c1218" haze="rgba(70,100,140,0.06)" />
      <Stars count={90} /><LightRays intensity={0.05} color="160,190,220" /><Hills color="#0a0e10" amp={0.5} /><JungleMist y={50} a={0.1} />
      <Parallax depth={0.35}>
        <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)", opacity: appear, textAlign: "center", width: "85%" }}>
          <div style={{ color: "rgba(190,210,220,0.75)", fontSize: 22, fontWeight: 500, letterSpacing: 4, marginBottom: 18 }}>EVOLUSI</div>
          <div style={{ color: "#E4EEF4", fontSize: 32, fontWeight: 600, fontFamily: "system-ui, sans-serif", lineHeight: 1.45, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            Manusia juga bisa mengalami<br />proses yang sama
          </div>
        </div>
      </Parallax>
      <Parallax depth={0.55}><div style={{ opacity: appear * 0.6 }}><HumanSilhouette x={50} bottom={10} height={120} color="#0a0e0c" /></div></Parallax>
      <Dust count={35} /><Grain opacity={0.025} /><Vignette strength={0.55} />
    </FadeWrap>
  );
};
