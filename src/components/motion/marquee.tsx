"use client";

/**
 * Marquee: a band of content that slides past forever.
 *
 * Direction behaviour it carries: speed and voice. Editorial glides at 40 px/s,
 * craft at 30, luminous at 55, and brutal shouts past at 90 px/s in uppercase
 * (the uppercase is set on the direction in `src/app/motion.css`).
 *
 * The movement itself is one CSS keyframe on transform. JavaScript only ever
 * measures the track once and writes the resulting duration onto the element as
 * a custom property, so px-per-second stays true at every width without a
 * single frame of scripted animation. The second copy of the children is
 * aria-hidden, so the band is read once.
 */

import { useIsomorphicLayoutEffect, useReducedMotion } from "motion/react";
import { useRef, type ReactElement, type ReactNode } from "react";
import { tokens } from "@/design/tokens";
import type { CssVars } from "./provider";

/** Track width assumed for the first paint, before anything is measured. */
export const ASSUMED_TRACK_PX = 1200;

/** How long one copy takes to cross, in seconds, at a given px-per-second. */
export function marqueeSeconds(widthPx: number, speedPxPerSecond: number): number {
  const speed = speedPxPerSecond > 0 ? speedPxPerSecond : 1;
  const width = widthPx > 0 ? widthPx : ASSUMED_TRACK_PX;
  return Math.round((width / speed) * 100) / 100;
}

export type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second. Defaults to the direction's `--motion-marquee`. */
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
};

export function Marquee({
  children,
  speed = tokens.motion.marquee,
  reverse = false,
  pauseOnHover = true,
  className,
}: MarqueeProps): ReactElement {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;

    const apply = (): void => {
      // The track holds two copies and travels exactly one of them.
      const copyWidth = track.scrollWidth / 2;
      track.style.setProperty("--iw-marquee-duration", `${marqueeSeconds(copyWidth, speed)}s`);
    };

    apply();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(apply);
    observer.observe(track);
    return () => observer.disconnect();
  }, [speed, reduced]);

  const style: CssVars = {
    "--iw-marquee-duration": `${marqueeSeconds(ASSUMED_TRACK_PX, speed)}s`,
  };

  return (
    <div
      data-marquee=""
      data-marquee-reverse={reverse ? "true" : "false"}
      data-marquee-pause={pauseOnHover ? "true" : "false"}
      className={className}
    >
      <div data-marquee-track="" ref={trackRef} style={style}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
