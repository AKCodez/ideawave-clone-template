/**
 * The motion kit: one import for every animated primitive in the template.
 *
 * Direction behaviour: each component reads `src/design/tokens.ts` for its own
 * distance, duration, easing, speed, lift and tilt, so composing a page never
 * involves choosing a number. The provider and the no-js script are imported
 * from their own paths by the root layout; everything else comes from here.
 *
 * House rules for anything that joins this folder: animate transform, opacity
 * and clip-path only; scroll-linked effects are CSS timelines, never listeners;
 * pointer effects write custom properties, never state; and every animated
 * element is `m.*`, never `motion.*`, or the lazy feature bundle is undone.
 */

export { AuroraMesh, type AuroraMeshProps } from "./aurora-mesh";
export { Counter, type CounterProps } from "./counter";
export { Grain, type GrainProps } from "./grain";
export { DEFAULT_MAGNETIC_STRENGTH, Magnetic, magneticOffset, type MagneticProps } from "./magnetic";
export { ASSUMED_TRACK_PX, Marquee, marqueeSeconds, type MarqueeProps } from "./marquee";
export { NoJsScript } from "./no-js";
export { PageTransition, hasViewTransition, type PageTransitionProps } from "./page-transition";
export { MAX_PARALLAX_PX, Parallax, clampParallax, type ParallaxProps } from "./parallax";
export {
  MotionProvider,
  cubicPoints,
  motionDirection,
  durations,
  msToSeconds,
  revealDistance,
  revealMs,
  revealTransition,
  stepCount,
  stepsEase,
  type CssVars,
  type MotionProviderProps,
} from "./provider";
export { Reveal, revealVariants, type RevealProps, type RevealTag, type RevealVariant } from "./reveal";
export { ScrollProgress, type ScrollProgressProps } from "./scroll-progress";
export { MAX_UNITS, SplitText, splitUnits, type SplitTextProps } from "./split-text";
export {
  DEFAULT_SPOTLIGHT_OPACITY,
  DEFAULT_SPOTLIGHT_SIZE,
  Spotlight,
  type SpotlightProps,
} from "./spotlight";
export { Stagger, StaggerItem, type StaggerItemProps, type StaggerProps } from "./stagger";
export { DEFAULT_TILT_DEGREES, TiltCard, tiltAngle, type TiltCardProps } from "./tilt-card";
