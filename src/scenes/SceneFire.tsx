import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  noise2D,
  random,
  useCurrentFrame,
} from "remotion";
import { Scene } from "../engine/types";

interface SceneFireProps {
  scene: Scene;
}

interface FlameParticle {
  x: number;
  baseSize: number;
  riseSpeed: number;
  swayAmount: number;
  swaySpeed: number;
  startDelay: number;
  hue: number;
}

interface EmberParticle {
  x: number;
  size: number;
  riseSpeed: number;
  driftAmount: number;
  startDelay: number;
}

const FLAME_COUNT = 24;
const EMBER_COUNT = 18;
const CYCLE_FRAMES = 150;

export const SceneFire: React.FC<SceneFireProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const seed = scene.id;

  const flames: FlameParticle[] = useMemo(() => {
    return new Array(FLAME_COUNT).fill(0).map((_, i) => ({
      x: 10 + random(`${seed}-flame-x-${i}`) * 80,
      baseSize: 40 + random(`${seed}-flame-size-${i}`) * 70,
      riseSpeed: 0.8 + random(`${seed}-flame-rise-${i}`) * 0.6,
      swayAmount: 8 + random(`${seed}-flame-sway-${i}`) * 14,
      swaySpeed: 0.04 + random(`${seed}-flame-swayspeed-${i}`) * 0.05,
      startDelay: random(`${seed}-flame-delay-${i}`) * CYCLE_FRAMES,
      hue: 18 + random(`${seed}-flame-hue-${i}`) * 25,
    }));
  }, [seed]);

  const embers: EmberParticle[] = useMemo(() => {
    return new Array(EMBER_COUNT).fill(0).map((_, i) => ({
      x: 15 + random(`${seed}-ember-x-${i}`) * 70,
      size: 2 + random(`${seed}-ember-size-${i}`) * 3,
      riseSpeed: 1.2 + random(`${seed}-ember-rise-${i}`) * 1,
      driftAmount: 15 + random(`${seed}-ember-drift-${i}`) * 25,
      startDelay: random(`${seed}-ember-delay-${i}`) * CYCLE_FRAMES * 1.6,
    }));
  }, [seed]);

  const glowPulse =
    0.75 + 0.25 * Math.abs(Math.sin(frame / 8) + Math.sin(frame / 13) * 0.5);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,140,30,0.55) 0%, rgba(255,80,0,0) 65%)",
          opacity: glowPulse,
        }}
      />
      {flames.map((flame, i) => {
        const localFrame = (frame + flame.startDelay) % CYCLE_FRAMES;
        const progress = localFrame / CYCLE_FRAMES;

        const riseY = interpolate(progress, [0, 1], [0, -110]);
        const scaleY = interpolate(
          progress,
          [0, 0.2, 0.8, 1],
          [0.3, 1, 0.85, 0]
        );
        const scaleX = interpolate(progress, [0, 0.3, 1], [0.6, 1, 0.4]);
        const opacity = interpolate(
          progress,
          [0, 0.1, 0.7, 1],
          [0, 0.85, 0.6, 0]
        );

        const noiseVal = noise2D(`${seed}-flame-noise-${i}`, frame / 20, i);
        const swayX = Math.sin(frame * flame.swaySpeed + i) * flame.swayAmount + noiseVal * 10;

        return (
          <div
            key={`flame-${i}`}
            style={{
              position: "absolute",
              left: `${flame.x}%`,
              bottom: "15%",
              width: flame.baseSize,
              height: flame.baseSize * 1.8,
              transform: `translate(${swayX}px, ${riseY}px) scaleY(${scaleY}) scaleX(${scaleX})`,
              opacity,
              background: `radial-gradient(ellipse at 50% 70%, hsla(${flame.hue}, 100%, 60%, 0.9) 0%, hsla(${flame.hue + 15}, 100%, 50%, 0.5) 40%, hsla(${flame.hue + 25}, 100%, 45%, 0) 75%)`,
              borderRadius: "50% 50% 40% 40%",
              filter: "blur(2px)",
            }}
          />
        );
      })}
      {embers.map((ember, i) => {
        const localFrame =
          (frame + ember.startDelay) % (CYCLE_FRAMES * 1.6);
        const progress = localFrame / (CYCLE_FRAMES * 1.6);

        const riseY = interpolate(progress, [0, 1], [0, -260]);
        const driftX = Math.sin(progress * Math.PI * 3 + i) * ember.driftAmount;
        const opacity = interpolate(
          progress,
          [0, 0.1, 0.8, 1],
          [0, 1, 0.6, 0]
        );
        const flicker = 0.6 + 0.4 * Math.abs(Math.sin(frame / 3 + i));

        return (
          <div
            key={`ember-${i}`}
            style={{
              position: "absolute",
              left: `${ember.x}%`,
              bottom: "18%",
              width: ember.size,
              height: ember.size,
              borderRadius: "50%",
              transform: `translate(${driftX}px, ${riseY}px)`,
              opacity: opacity * flicker,
              backgroundColor: "#FFB347",
              boxShadow: "0 0 6px 2px rgba(255,140,30,0.8)",
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(20,8,0,0.65) 0%, rgba(20,8,0,0) 35%)",
        }}
      />
    </AbsoluteFill>
  );
};
