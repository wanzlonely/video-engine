import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

interface BackgroundLayerProps {
  gradient?: [string, string];
  color?: string;
  stars?: boolean;
  particles?: boolean;
  seed?: string;
}

interface StarData {
  x: number;
  y: number;
  size: number;
  phaseOffset: number;
  speed: number;
}

interface ParticleData {
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftSpeed: number;
  opacityBase: number;
}

const STAR_COUNT = 90;
const PARTICLE_COUNT = 40;

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  gradient,
  color,
  stars = false,
  particles = false,
  seed = "bg",
}) => {
  const frame = useCurrentFrame();

  const starData: StarData[] = useMemo(() => {
    return new Array(STAR_COUNT).fill(0).map((_, i) => ({
      x: random(`${seed}-star-x-${i}`) * 100,
      y: random(`${seed}-star-y-${i}`) * 70,
      size: 1 + random(`${seed}-star-size-${i}`) * 2.2,
      phaseOffset: random(`${seed}-star-phase-${i}`) * Math.PI * 2,
      speed: 0.05 + random(`${seed}-star-speed-${i}`) * 0.08,
    }));
  }, [seed]);

  const particleData: ParticleData[] = useMemo(() => {
    return new Array(PARTICLE_COUNT).fill(0).map((_, i) => ({
      x: random(`${seed}-particle-x-${i}`) * 100,
      y: random(`${seed}-particle-y-${i}`) * 100,
      size: 1.5 + random(`${seed}-particle-size-${i}`) * 3,
      driftX: (random(`${seed}-particle-drift-${i}`) - 0.5) * 30,
      driftSpeed: 0.3 + random(`${seed}-particle-speed-${i}`) * 0.6,
      opacityBase: 0.15 + random(`${seed}-particle-opacity-${i}`) * 0.4,
    }));
  }, [seed]);

  const background = gradient
    ? `linear-gradient(180deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`
    : color || "#0A0E1A";

  return (
    <AbsoluteFill style={{ background }}>
      {stars &&
        starData.map((star, i) => {
          const twinkle =
            0.4 +
            0.6 *
              Math.abs(Math.sin(frame * star.speed + star.phaseOffset));
          return (
            <div
              key={`star-${i}`}
              style={{
                position: "absolute",
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                opacity: twinkle,
                boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.6)`,
              }}
            />
          );
        })}
      {particles &&
        particleData.map((particle, i) => {
          const progress = (frame * particle.driftSpeed) % 400;
          const yPos = interpolate(progress, [0, 400], [100, -10], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const xOffset =
            Math.sin((frame + i * 40) / 60) * particle.driftX;
          const fadeOut = interpolate(
            progress,
            [0, 30, 370, 400],
            [0, 1, 1, 0]
          );
          return (
            <div
              key={`particle-${i}`}
              style={{
                position: "absolute",
                left: `calc(${particle.x}% + ${xOffset}px)`,
                top: `${yPos}%`,
                width: particle.size,
                height: particle.size,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                opacity: particle.opacityBase * fadeOut,
                filter: "blur(0.5px)",
              }}
            />
          );
        })}
    </AbsoluteFill>
  );
};
