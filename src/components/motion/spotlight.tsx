"use client";

/**
 * Spotlight: an accent glow that follows the cursor across a panel.
 *
 * Direction behaviour it carries: luminous, and only luminous, where the glow
 * is 320px across. The other three directions default to a size of 0, which
 * renders the wrapper and nothing else: a lit panel is what makes luminous read
 * as glass, and putting one behind an editorial rule or a brutal slab would
 * cost exactly the difference the four directions are meant to have.
 *
 * The glow is a fixed-size layer moved by transform alone, so nothing repaints
 * a gradient per frame, and a pointer move writes two custom properties rather
 * than touching React. It sits behind the panel content and never takes a
 * pointer event.
 */

import { useReducedMotion } from "motion/react";
import { useCallback, useRef, type PointerEvent, type ReactElement, type ReactNode } from "react";
import { motionDirection, type CssVars } from "./provider";

/** The luminous keynote glow, in px. Every other direction keeps its lights off. */
export const DEFAULT_SPOTLIGHT_SIZE = motionDirection === "luminous" ? 320 : 0;

/** How strongly the glow reads at rest under the cursor. */
export const DEFAULT_SPOTLIGHT_OPACITY = 0.22;

export type SpotlightProps = {
  children: ReactNode;
  className?: string;
  /** Diameter of the glow in px. 0 turns the wrapper into a plain container. */
  size?: number;
  /** Peak opacity of the glow, 0 to 1. */
  opacity?: number;
};

export function Spotlight({
  children,
  className,
  size = DEFAULT_SPOTLIGHT_SIZE,
  opacity = DEFAULT_SPOTLIGHT_OPACITY,
}: SpotlightProps): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  const follow = useCallback((event: PointerEvent<HTMLDivElement>): void => {
    const node = ref.current;
    if (!node || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
    const box = node.getBoundingClientRect();
    node.style.setProperty("--sx", `${Math.round(event.clientX - box.left)}px`);
    node.style.setProperty("--sy", `${Math.round(event.clientY - box.top)}px`);
  }, []);

  if (size <= 0 || reduced) {
    return <div className={className}>{children}</div>;
  }

  const style: CssVars = { "--spot-size": `${size}px`, "--spot-opacity": opacity };

  return (
    <div ref={ref} data-spotlight="" className={className} style={style} onPointerMove={follow}>
      <div data-spotlight-layer="" aria-hidden="true" />
      {children}
    </div>
  );
}
