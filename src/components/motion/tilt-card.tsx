"use client";

/**
 * TiltCard: a panel that turns a few degrees towards the cursor.
 *
 * Direction behaviour it carries: the angle is the direction's own
 * `--motion-tilt`. Luminous turns 6 degrees, craft a restrained 4, and
 * editorial and brutal are flat by design at 0 degrees, where this becomes a
 * pass-through wrapper.
 *
 * A pointer move writes two custom properties and nothing else, so no frame of
 * this costs a React render. Reduced motion and coarse pointers get the flat
 * card, the second enforced again in `src/app/motion.css`.
 */

import { useReducedMotion } from "motion/react";
import { useCallback, useRef, type PointerEvent, type ReactElement, type ReactNode } from "react";
import { tokens } from "@/design/tokens";

/** Luminous 6 degrees, craft 4, editorial and brutal flat. */
export const DEFAULT_TILT_DEGREES = tokens.motion.tilt;

/** The angle for one axis, given where the pointer sits across the card. */
export function tiltAngle(pointer: number, start: number, size: number, degrees: number): number {
  if (size <= 0) return 0;
  const ratio = (pointer - (start + size / 2)) / (size / 2);
  const clamped = Math.max(-1, Math.min(1, ratio));
  return Math.round(clamped * degrees * 10) / 10;
}

export type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. 0 turns the wrapper into a pass-through. */
  degrees?: number;
};

export function TiltCard({
  children,
  className,
  degrees = DEFAULT_TILT_DEGREES,
}: TiltCardProps): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  const settle = useCallback((): void => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  }, []);

  const follow = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      const node = ref.current;
      if (!node || (event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
      const box = node.getBoundingClientRect();
      node.style.setProperty("--ry", `${tiltAngle(event.clientX, box.left, box.width, degrees)}deg`);
      node.style.setProperty("--rx", `${-tiltAngle(event.clientY, box.top, box.height, degrees)}deg`);
    },
    [degrees],
  );

  if (degrees <= 0 || reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      data-tilt=""
      className={className}
      onPointerMove={follow}
      onPointerLeave={settle}
      onPointerCancel={settle}
      onBlur={settle}
    >
      {children}
    </div>
  );
}
