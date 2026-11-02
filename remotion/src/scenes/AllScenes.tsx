import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { GradientBg, Vignette, Parallax, Stars, Dust, Embers } from "../components/primitives";

type SceneProps = { gradient: string[]; localFrame: number; durationFrames: number };

export const SceneSky: React.FC<SceneProps> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Stars count={100} />
      <Parallax depth={0.25}>
        <div style={{ position: "absolute", left: `${45 + Math.sin(t * 0.12) * 4}%`, top: "20%", width: "70%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(60,100,190,0.18) 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />
      </Parallax>
      <Dust count={55} />
      <Vignette />
    </AbsoluteFill>
  );
};

export const SceneText: React.FC<SceneProps> = ({ gradient, localFrame }) => {
  const lineW = interpolate(localFrame, [0, 14], [0, 36], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Stars count={70} />
      <Dust count={40} />
      <Parallax depth={0.4}>
        <div style={{ position: "absolute", left: "50%", top: "52%", width: `${lineW}%`, height: 3, background: "rgba(255,214,10,0.75)", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(255,214,10,0.4)" }} />
      </Parallax>
      <Vignette />
    </AbsoluteFill>
  );
};

export const SceneBuilding: React.FC<SceneProps> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.16}>
        <div style={{ position: "absolute", right: "15%", top: "18%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,155,70,0.28) 0%, transparent 70%)" }} />
      </Parallax>
      <Parallax depth={0.72}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "42%", background: "linear-gradient(180deg, #0b182c 0%, #07121f 50%, #03060c 100%)" }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: `${38 - i * 5}%`, height: 2, background: `rgba(120,185,230,${0.1 + (i % 3) * 0.03})`, transform: `translateY(${Math.sin(t * 1.5 + i) * 4}px)` }} />
        ))}
      </Parallax>
      <Parallax depth={0.55}>
        <div style={{ position: "absolute", left: "50%", bottom: "40%", transform: "translateX(-50%)" }}>
          <div style={{ width: 360, height: 220, background: "#0a0e16", margin: "0 auto" }} />
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: -280 }}>
            <div style={{ width: 70, height: 280, background: "#0a0e16" }} />
            <div style={{ width: 84, height: 330, background: "#0a0e16", borderRadius: "40px 40px 0 0" }} />
            <div style={{ width: 70, height: 300, background: "#0a0e16" }} />
          </div>
          {[-120, -60, 0, 60, 120].map((x, i) => (
            <div key={i} style={{ position: "absolute", left: `calc(50% + ${x}px)`, bottom: 120, width: 12, height: 14, background: `rgba(255,195,70,${0.15 + 0.12 * Math.sin(t * 3.5 + i)})`, transform: "translateX(-50%)" }} />
          ))}
        </div>
      </Parallax>
      <Dust count={45} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

export const SceneCharacter: React.FC<SceneProps> = ({ gradient, localFrame }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const appear = interpolate(localFrame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const floatY = Math.sin(t * 1.4) * 10;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.28}>
        <div style={{ position: "absolute", left: "50%", top: "26%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,190,90,${0.18 * appear}) 0%, transparent 70%)`, transform: "translate(-50%, -50%)" }} />
      </Parallax>
      <Parallax depth={0.36}>
        <div style={{ position: "absolute", left: "50%", top: `calc(24% + ${floatY}px)`, transform: `translateX(-50%) rotate(${Math.sin(t * 0.7) * 2}deg) scale(${appear})`, opacity: appear, fontSize: 90, filter: "drop-shadow(0 0 24px rgba(255,200,60,0.5))" }}>👑</div>
      </Parallax>
      <Parallax depth={0.72}>
        <div style={{ position: "absolute", left: "50%", bottom: "12%", transform: `translateX(-50%) scale(${1 + Math.sin(t * 1.1) * 0.015})`, width: 160, height: 220, background: "rgba(28,20,16,0.92)", borderRadius: "50% 50% 8px 8px" }} />
        <div style={{ position: "absolute", left: "50%", bottom: "8%", transform: "translateX(-50%)", width: "70%", height: 40, background: "rgba(18,14,22,0.9)", borderRadius: "50%" }} />
      </Parallax>
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

export const SceneBritain: React.FC<SceneProps> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pulse = 0.4 + 0.6 * Math.sin(t * 3.5);
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Stars count={60} />
      <Parallax depth={0.38}>
        <div style={{ position: "absolute", left: 0, top: "30%", width: "45%", height: "70%", background: "linear-gradient(135deg, rgba(35,55,110,0.42), rgba(35,55,110,0.15))", clipPath: "polygon(0 0, 100% 15%, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", right: 0, top: "30%", width: "45%", height: "70%", background: "linear-gradient(225deg, rgba(115,65,28,0.38), rgba(115,65,28,0.12))", clipPath: "polygon(0 15%, 100% 0, 100% 100%, 0 100%)" }} />
      </Parallax>
      <Parallax depth={0.55}>
        <div style={{ position: "absolute", left: "50%", top: "26%", width: 4 + pulse * 2, height: "54%", background: `rgba(255,70,50,${0.3 + 0.3 * pulse})`, transform: "translateX(-50%)", boxShadow: `0 0 ${12 * pulse}px rgba(255,70,50,0.5)` }} />
      </Parallax>
      <Parallax depth={0.6}>
        <div style={{ position: "absolute", left: "14%", top: "36%", fontSize: 64, transform: `rotate(${Math.sin(t * 2) * 4}deg)` }}>🏴</div>
        <div style={{ position: "absolute", right: "14%", top: "38%", fontSize: 64, transform: `rotate(${Math.sin(t * 2 + 1) * 4}deg)` }}>🚩</div>
      </Parallax>
      <Dust count={40} />
      <Vignette strength={0.48} />
    </AbsoluteFill>
  );
};

export const SceneUltimatum: React.FC<SceneProps> = ({ gradient, localFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const progress = localFrame / Math.max(1, durationFrames);
  const handDeg = -90 + progress * 280;
  const secDeg = -90 + ((t * 2.5 * 180) / Math.PI) % 360;
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.32}>
        <div style={{ position: "absolute", left: "50%", top: "29%", transform: "translate(-50%, -50%)", width: 260, height: 260 }}>
          <div style={{ position: "absolute", inset: -40, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,90,40,${0.15 + 0.1 * pulse}) 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `8px solid rgba(255,200,100,${0.85 + 0.15 * pulse})`, boxShadow: "0 0 20px rgba(255,150,40,0.3)" }} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * 360 - 90;
            return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 3, height: i % 3 === 0 ? 16 : 10, background: "rgba(255,255,255,0.5)", transformOrigin: "50% 0", transform: `rotate(${a + 90}deg) translateY(-110px)` }} />;
          })}
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 5, height: 90, background: "#FF453A", borderRadius: 3, transformOrigin: "50% 100%", transform: `translate(-50%, -100%) rotate(${handDeg + 90}deg)` }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: 100, background: "rgba(255,255,255,0.4)", transformOrigin: "50% 100%", transform: `translate(-50%, -100%) rotate(${secDeg + 90}deg)` }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, borderRadius: "50%", background: "#FFD60A", transform: "translate(-50%, -50%)" }} />
        </div>
      </Parallax>
      <Parallax depth={0.75}>
        {Array.from({ length: 24 }).map((_, i) => {
          const ang = (i / 24) * Math.PI * 2 + t * 0.4;
          const dist = 160 + (i % 5) * 18 + Math.sin(t * 2 + i) * 12;
          return <div key={i} style={{ position: "absolute", left: `calc(50% + ${Math.cos(ang) * dist}px)`, top: `calc(29% + ${Math.sin(ang) * dist * 0.6}px)`, width: 3, height: 3, borderRadius: "50%", background: `rgba(255,120,60,${0.15 + 0.2 * Math.sin(t * 2 + i)})` }} />;
        })}
      </Parallax>
      <Vignette strength={0.52} />
    </AbsoluteFill>
  );
};

export const SceneFire: React.FC<SceneProps> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blasts = [
    { x: 50, y: 44, power: 180, phase: 0 },
    { x: 32, y: 54, power: 110, phase: 1.2 },
    { x: 68, y: 50, power: 120, phase: 2.4 },
    { x: 45, y: 58, power: 80, phase: 0.8 },
  ];
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      {blasts.map((b, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 7.5 + b.phase);
        const size = b.power * pulse;
        return (
          <Parallax key={i} depth={0.45 + i * 0.05}>
            <div style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,245,190,0.55) 0%, rgba(255,150,40,0.3) 25%, rgba(255,40,10,0.12) 50%, transparent 70%)", transform: "translate(-50%, -50%)" }} />
          </Parallax>
        );
      })}
      <Embers count={70} />
      <Parallax depth={0.6}>
        <div style={{ position: "absolute", left: "18%", bottom: "28%", width: 110, height: 200, background: "rgba(8,4,4,0.95)" }} />
        <div style={{ position: "absolute", left: "38%", bottom: "28%", width: 160, height: 270, background: "rgba(8,4,4,0.95)" }} />
        <div style={{ position: "absolute", left: "60%", bottom: "28%", width: 100, height: 170, background: "rgba(8,4,4,0.95)" }} />
      </Parallax>
      <Parallax depth={0.76}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "28%", background: "linear-gradient(180deg, #0b182c, #03060c)" }} />
      </Parallax>
      <Parallax depth={0.8}>
        <div style={{ position: "absolute", left: "12%", bottom: "18%", fontSize: 70, transform: `translateY(${Math.sin(t * 1.7) * 4}px)` }}>🚢</div>
        <div style={{ position: "absolute", right: "10%", bottom: "16%", fontSize: 55, transform: `translateY(${Math.sin(t * 1.7 + 1.2) * 4}px)` }}>🚢</div>
      </Parallax>
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

export const SceneThirtyEight: React.FC<SceneProps> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.28}>
        <div style={{ position: "absolute", left: "50%", top: "37%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,10,0.14) 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />
        {[0, 1, 2].map((i) => {
          const p = ((t * 0.7 + i * 0.9) % 2.8) / 2.8;
          return <div key={i} style={{ position: "absolute", left: "50%", top: "37%", width: 280 + p * 240 + i * 40, height: 280 + p * 240 + i * 40, borderRadius: "50%", border: `2px solid rgba(255,214,10,${(1 - p) * 0.3})`, transform: "translate(-50%, -50%)" }} />;
        })}
      </Parallax>
      <Stars count={50} />
      <Vignette strength={0.48} />
    </AbsoluteFill>
  );
};

export const SceneCost: React.FC<SceneProps> = ({ gradient }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      <GradientBg colors={gradient} />
      <Parallax depth={0.55}>
        {[{ l: "10%", h: 155, w: 90 }, { l: "28%", h: 250, w: 140 }, { l: "50%", h: 125, w: 85 }, { l: "68%", h: 210, w: 110 }].map((b, i) => (
          <div key={i} style={{ position: "absolute", left: b.l, bottom: "38%", width: b.w, height: b.h, background: "#0a0c12", transform: `translateY(${Math.sin(t + i) * 2}px)` }} />
        ))}
      </Parallax>
      <Embers count={40} />
      <Dust count={50} />
      <Vignette strength={0.52} />
    </AbsoluteFill>
  );
};
