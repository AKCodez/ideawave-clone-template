"use client";

/**
 * MotionProvider: the one place the animation runtime is configured, and the
 * single source of the motion tokens every primitive in this folder reads.
 *
 * Direction behaviour it carries: all four. The direction picks the reveal
 * duration (editorial and craft take the long step, brutal snaps, luminous
 * springs), the easing (expo, spring, steps, soft) and the travel distance;
 * every other file here asks this module rather than inventing a number.
 *
 * The feature bundle is imported lazily so the initial JavaScript carries only
 * the renderer. That is why every animated element in this folder is `m.div`
 * and never `motion.div`: a single `motion.*` import would pull the whole
 * bundle back in and undo it. `strict` is deliberately left off, so a stray
 * `motion.*` in a generated app costs bundle size instead of throwing.
 */

import { LazyMotion, MotionConfig, type FeatureBundle, type Transition } from "motion/react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { tokens } from "@/design/tokens";
import type { Direction } from "@/design/types";

/**
 * A style object that may also carry custom properties. Pointer effects and the
 * scroll-driven timelines are configured entirely through these, never through
 * a literal value in a class name.
 */
export type CssVars = CSSProperties & Record<`--${string}`, string | number>;

const loadFeatures = (): Promise<FeatureBundle> =>
  import("motion/react").then((mod) => mod.domAnimation);

/** The art direction this build was generated for. */
export const motionDirection: Direction = tokens.direction.key;

/** Durations in ms, already carrying the brand's durationScale. */
export const durations = tokens.motion.durations;

/**
 * Which duration step an entrance takes. Editorial wipes for the long beat and
 * craft fades for nearly as long; brutal snaps; luminous is a spring, so its
 * step only matters as the ceiling the spring settles inside.
 */
const REVEAL_STEP: Record<Direction, 3 | 4> = { editorial: 4, luminous: 3, brutal: 3, craft: 4 };

/** How long an entrance runs, in ms. Editorial 900, craft 800, brutal 320. */
export const revealMs: number = durations[REVEAL_STEP[motionDirection]];

/** How far an entrance travels, in px, already carrying the brand's intensity. */
export const revealDistance: number = tokens.motion.distance;

/** Luminous settles with an overshoot instead of easing to a stop. */
export const SPRING = { stiffness: 300, damping: 20 } as const;

/** The scale a luminous entrance overshoots to on its way to 1. */
export const OVERSHOOT_FROM = 0.98;

/** Milliseconds to the seconds every motion transition is written in. */
export function msToSeconds(ms: number): number {
  return Math.max(0, ms) / 1000;
}

/** The four control points of a `cubic-bezier(...)` token, or null if it is not one. */
export function cubicPoints(value: string): [number, number, number, number] | null {
  const match = /^cubic-bezier\(([^)]*)\)$/.exec(value.trim());
  const body = match?.[1];
  if (body === undefined) return null;
  const parts = body.split(",").map((part) => Number(part.trim()));
  const [a, b, c, d] = parts;
  if (parts.length !== 4 || a === undefined || b === undefined || c === undefined || d === undefined) {
    return null;
  }
  if (![a, b, c, d].every((n) => Number.isFinite(n))) return null;
  return [a, b, c, d];
}

/** How many steps a `steps(n, end)` token jumps in, or null if it is not one. */
export function stepCount(value: string): number | null {
  const match = /^steps\(\s*(\d+)/.exec(value.trim());
  const digits = match?.[1];
  if (digits === undefined) return null;
  const count = Number(digits);
  return Number.isFinite(count) && count > 0 ? count : null;
}

/**
 * The easing function for `steps(n, end)`: progress only ever lands on one of n
 * rungs, which is what makes the brutal direction read as printed rather than
 * animated.
 */
export function stepsEase(count: number): (t: number) => number {
  const rungs = Math.max(1, Math.round(count));
  return (t: number) => Math.min(1, Math.max(0, Math.floor(t * rungs) / rungs));
}

const revealEasingToken = tokens.motion.easings[tokens.motion.reveal];

/** The direction's reveal easing, as something motion can run. */
export const revealEase: readonly [number, number, number, number] | ((t: number) => number) =
  cubicPoints(revealEasingToken) ?? stepsEase(stepCount(revealEasingToken) ?? 1);

/**
 * The transition every entrance in this folder shares. Reduced motion does not
 * shorten it, it removes it: the element is simply placed at its final frame.
 */
export function revealTransition(reduced: boolean, delayMs = 0): Transition {
  if (reduced) return { duration: 0, delay: 0 };
  const delay = msToSeconds(delayMs);
  if (tokens.motion.reveal === "spring") {
    return { type: "spring", stiffness: SPRING.stiffness, damping: SPRING.damping, delay };
  }
  return { duration: msToSeconds(revealMs), ease: revealEase, delay };
}

export type MotionProviderProps = { children: ReactNode };

export function MotionProvider({ children }: MotionProviderProps): ReactElement {
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
