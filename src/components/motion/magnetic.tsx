"use client";

/**
 * Magnetic: a control that leans towards the cursor.
 *
 * Direction behaviour it carries: luminous, and only luminous. Its call to
 * action pulls up to three times the direction's hover lift (9px at lively
 * intensity); the other three directions get a strength of 0, which makes this
 * a pass-through wrapper, because a magnet under an editorial rule or a brutal
 * slab would blur what makes them different.
 *
 * A pointer move writes two custom properties onto the element and nothing
 * else: no state, no re-render, no layout read beyond one rect. Touch pointers
 * are ignored here, and `src/app/motion.css` also neutralises the transform
 * wherever there is no fine pointer.
 */

import { useReducedMotion } from "motion/react";
import { useCallback, useRef, type PointerEvent, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tokens } from "@/design/tokens";
import { motionDirection } from "./provider";

/** Luminous pulls; the rest stay still. */
export const DEFAULT_MAGNETIC_STRENGTH =
  motionDirection === "luminous" ? Math.round(tokens.motion.lift * 3) : 0;

/** How far the element leans on one axis, given where the pointer is across it. */
export function magneticOffset(
  pointer: number,
  start: number,
  size: number,
  strength: number,
): number {
  if (size <= 0) return 0;
  const ratio = (pointer - (start + size / 2)) / (size / 2);
  const clamped = Math.max(-1, Math.min(1, ratio));
  return Math.round(clamped * strength * 10) / 10;
}

export type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Maximum lean in px. 0 turns the wrapper into a pass-through. */
  strength?: number;
};

export function Magnetic({
  children,
  className,
  strength = DEFAULT_MAGNETIC_STRENGTH,
}: MagneticProps): ReactElement {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  const settle = useCallback((): void => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--mx", "0px");
    node.style.setProperty("--my", "0px");
  }, []);

  const follow = useCallback(
    (event: PointerEvent<HTMLSpanElement>): void => {
      const node = ref.current;
      if (!node || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
      const box = node.getBoundingClientRect();
      node.style.setProperty("--mx", `${magneticOffset(event.clientX, box.left, box.width, strength)}px`);
      node.style.setProperty("--my", `${magneticOffset(event.clientY, box.top, box.height, strength)}px`);
    },
    [strength],
  );

  if (strength <= 0 || reduced) {
    return <span className={cn("inline-block", className)}>{children}</span>;
  }

  return (
    <span
      ref={ref}
      data-magnetic=""
      className={cn("inline-block", className)}
      onPointerMove={follow}
      onPointerLeave={settle}
      onPointerCancel={settle}
      onBlur={settle}
    >
      {children}
    </span>
  );
}
