/**
 * Parallax: a layer that drifts as it crosses the viewport.
 *
 * Direction behaviour it carries: the travel is the direction's own
 * `--motion-distance`, so editorial drifts furthest and brutal barely moves.
 *
 * There is no scroll listener and no React state here at all. The movement is a
 * CSS scroll-driven animation on a `view()` timeline, declared in
 * `src/app/motion.css` and gated behind `@supports`; a browser without scroll
 * timelines simply leaves the layer where the layout put it. The travel is
 * capped so a layer can never drift out of the section that owns it.
 */

import type { ReactElement, ReactNode } from "react";
import { tokens } from "@/design/tokens";
import type { CssVars } from "./provider";

/** The furthest a parallax layer may ever travel, in px. */
export const MAX_PARALLAX_PX = 80;

/** Round and clamp a requested travel so nothing leaves its container. */
export function clampParallax(strength: number, max: number = MAX_PARALLAX_PX): number {
  if (!Number.isFinite(strength)) return 0;
  return Math.max(-max, Math.min(max, Math.round(strength)));
}

export type ParallaxProps = {
  children: ReactNode;
  /** Travel in px, positive meaning the layer starts low and rises. */
  strength?: number;
  className?: string;
};

export function Parallax({
  children,
  strength = tokens.motion.distance,
  className,
}: ParallaxProps): ReactElement {
  const travel = clampParallax(strength);
  const style: CssVars = {
    "--parallax-from": `${travel}px`,
    "--parallax-to": `${-travel}px`,
  };

  return (
    <div data-parallax="" className={className} style={style}>
      {children}
    </div>
  );
}
