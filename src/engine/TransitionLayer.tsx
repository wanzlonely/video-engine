import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TransitionType } from "./types";

interface TransitionLayerProps {
  type: TransitionType;
  /** frames since this scene's sequence started */
  localFrame: number;
  /** length of the transition-in, in frames */
  transitionFrames: number;
  children: React.ReactNode;
}

/**
 * Wraps a scene's content and applies an entrance transition over the
 * first `transitionFrames` frames of the scene's own Sequence.
 * Pure presentational layer — no knowledge of global timeline position.
 */
export const TransitionLayer: React.FC<TransitionLayerProps> = ({
  type,
  localFrame,
  transitionFrames,
  children,
}) => {
  if (type === "none" || transitionFrames <= 0) {
    return <>{children}</>;
  }

  const progress = interpolate(
    localFrame,
    [0, transitionFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (type === "fade") {
    return <AbsoluteFill style={{ opacity: progress }}>{children}</AbsoluteFill>;
  }

  if (type === "slide-left" || type === "slide-right") {
    const direction = type === "slide-left" ? 1 : -1;
    const translateX = interpolate(progress, [0, 1], [direction * 100, 0]);
    return (
      <AbsoluteFill style={{ transform: `translateX(${translateX}%)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (type === "wipe") {
    const clip = interpolate(progress, [0, 1], [0, 100]);
    return (
      <AbsoluteFill
        style={{ clipPath: `inset(0 ${100 - clip}% 0 0)` }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  return <>{children}</>;
};
