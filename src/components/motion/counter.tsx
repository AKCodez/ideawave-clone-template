"use client";

/**
 * Counter: a number that counts up the first time it is seen.
 *
 * Direction behaviour it carries: the climb takes the direction's longest
 * duration step and uses its easing, so brutal counts in five visible jumps
 * while editorial and craft glide. Luminous borrows the soft curve rather than
 * its spring, because a number that overshoots its own total reads as a bug.
 *
 * The server renders the final, formatted value, and so does the first client
 * render: there is no flash of zero in the HTML and no hydration mismatch. The
 * climb is written straight to the text node, so counting never re-renders
 * React, and reduced motion leaves the final value exactly where it was.
 */

import { animate, useInView, useIsomorphicLayoutEffect, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { tokens } from "@/design/tokens";
import { REVEAL_SETTLE_MS, cubicPoints, durations, msToSeconds, stepCount, stepsEase } from "./provider";

/** The climb takes the longest duration step this direction owns. */
const COUNT_MS = durations[4];

/** A counter never overshoots, so a spring direction falls back to its soft curve. */
const countEasingToken =
  tokens.motion.reveal === "spring"
    ? tokens.motion.easings["out-soft"]
    : tokens.motion.easings[tokens.motion.reveal];

const countEase: readonly [number, number, number, number] | ((t: number) => number) =
  cubicPoints(countEasingToken) ?? stepsEase(stepCount(countEasingToken) ?? 1);

const defaultFormat = (value: number): string =>
  new Intl.NumberFormat("en-US").format(Math.round(value));

export type CounterProps = {
  value: number;
  format?: (n: number) => string;
  className?: string;
};

export function Counter({ value, format = defaultFormat, className }: CounterProps): ReactElement {
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // A number that is never scrolled to still climbs: see REVEAL_SETTLE_MS in ./provider.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), REVEAL_SETTLE_MS);
    return () => clearTimeout(timer);
  }, []);

  // Once JavaScript is running, drop to zero before the first paint after
  // hydration, so the climb has somewhere to start. Without JavaScript, or
  // under reduced motion, this never runs and the final value simply stands.
  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || reduced || started.current) return;
    node.textContent = format(0);
  }, [format, reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !(inView || settled) || reduced || started.current) return;
    started.current = true;

    const controls = animate(0, value, {
      duration: msToSeconds(COUNT_MS),
      ease: countEase,
      onUpdate: (latest: number) => {
        node.textContent = format(latest);
      },
      onComplete: () => {
        node.textContent = format(value);
      },
    });

    return () => controls.stop();
  }, [inView, settled, reduced, value, format]);

  return (
    <span ref={ref} className={cn("numeric", className)}>
      {format(value)}
    </span>
  );
}
