import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Scene } from "../engine/types";
import { BackgroundLayer } from "../engine/BackgroundLayer";

interface SceneBuildingProps {
  scene: Scene;
}

interface Building {
  x: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  windows: { x: number; y: number; litPhase: number }[];
}

const LAYER_CONFIG = [
  { count: 6, depth: 0.4, color: "#0D1320", parallax: 0.2 },
  { count: 7, depth: 0.65, color: "#131B2E", parallax: 0.45 },
  { count: 8, depth: 1, color: "#1C2740", parallax: 0.75 },
];

export const SceneBuilding: React.FC<SceneBuildingProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const seed = scene.id;

  const layers = useMemo(() => {
    return LAYER_CONFIG.map((layerConfig, layerIndex) => {
      const buildings: Building[] = new Array(layerConfig.count)
        .fill(0)
        .map((_, i) => {
          const windows = new Array(Math.round(4 + random(`${seed}-wc-${layerIndex}-${i}`) * 6))
            .fill(0)
            .map((_, w) => ({
              x: random(`${seed}-wx-${layerIndex}-${i}-${w}`) * 80 + 10,
              y: random(`${seed}-wy-${layerIndex}-${i}-${w}`) * 85 + 5,
              litPhase: random(`${seed}-wp-${layerIndex}-${i}-${w}`) * Math.PI * 2,
            }));

          return {
            x: (i / layerConfig.count) * 110 - 5 + random(`${seed}-bx-${layerIndex}-${i}`) * 8,
            width: 8 + random(`${seed}-bw-${layerIndex}-${i}`) * 7,
            height: 25 + random(`${seed}-bh-${layerIndex}-${i}`) * 50 * layerConfig.depth,
            depth: layerConfig.depth,
            color: layerConfig.color,
            windows,
          };
        });
      return { buildings, parallax: layerConfig.parallax };
    });
  }, [seed]);

  return (
    <AbsoluteFill>
      <BackgroundLayer
        gradient={(scene.background?.gradient as [string, string]) || ["#1B2735", "#0A0E1A"]}
        stars
        seed={`${seed}-sky`}
      />
      {layers.map((layer, layerIndex) => {
        const parallaxX = interpolate(frame, [0, 600], [0, -30 * layer.parallax], {
          extrapolateRight: "clamp",
        });

        return (
          <AbsoluteFill
            key={`layer-${layerIndex}`}
            style={{
              transform: `translateX(${parallaxX}px)`,
            }}
          >
            {layer.buildings.map((building, i) => (
              <div
                key={`building-${layerIndex}-${i}`}
                style={{
                  position: "absolute",
                  left: `${building.x}%`,
                  bottom: 0,
                  width: `${building.width}%`,
                  height: `${building.height}%`,
                  backgroundColor: building.color,
                }}
              >
                {building.windows.map((win, w) => {
                  const flicker =
                    0.3 + 0.7 * Math.abs(Math.sin(frame / 40 + win.litPhase));
                  const isLit = flicker > 0.55;
                  return (
                    <div
                      key={`window-${w}`}
                      style={{
                        position: "absolute",
                        left: `${win.x}%`,
                        top: `${win.y}%`,
                        width: 4,
                        height: 6,
                        backgroundColor: isLit ? "#FFD88A" : "#070A12",
                        opacity: isLit ? flicker : 0.5,
                        boxShadow: isLit
                          ? "0 0 4px rgba(255,216,138,0.7)"
                          : "none",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(5,7,12,0.5) 0%, rgba(5,7,12,0) 25%)",
        }}
      />
    </AbsoluteFill>
  );
};
