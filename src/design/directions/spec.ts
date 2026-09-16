/**
 * The shape of an art direction. Four of these ship; a brand names one and the
 * generator turns it into CSS. Everything a direction can change lives here, so
 * two directions can never differ by anything a component hardcodes.
 */
import type { ColorRecipe } from "../color";
import type { Direction } from "../types";

/** One step of the type scale: a fluid clamp with its leading and tracking. */
export type TypeStep = {
  /** Smallest size, e.g. "2.1rem". */
  min: string;
  /** Viewport term of the clamp, e.g. "1.3rem + 3.4vw". */
  fluid: string;
  /** Largest size. */
  max: string;
  leading: string;
  tracking: string;
  weight: number;
  /** Which family renders this step. */
  family: "display" | "body" | "mono";
  transform?: "uppercase";
};

export const TYPE_TOKENS = ["display", "h1", "h2", "h3", "lead", "body", "small", "caption"] as const;
export type TypeToken = (typeof TYPE_TOKENS)[number];

export type RadiusRamp = { sm: string; md: string; lg: string; xl: string; "2xl": string; input: string };

export type ShadowRecipe = {
  /** Neutral tint alphas per scheme, softest to strongest. */
  alphaDark: [number, number, number];
  alphaLight: [number, number, number];
  /** Blur multiplier: brutal keeps everything sharp, luminous spreads. */
  spread: number;
  /** Offset of the flat `--shadow-hard` in px, used by the brutal direction. */
  hardOffset: number;
  /** Accent glow alpha, 0 turns `--shadow-glow` into a plain ring. */
  glowAlpha: number;
};

export type MotionRecipe = {
  /** The five duration steps in ms, before `brand.motion.durationScale`. */
  durations: [number, number, number, number, number];
  /** Distance a reveal travels, in px. */
  distance: number;
  /** Which easing a reveal uses by default. */
  reveal: "out-soft" | "out-expo" | "spring" | "step";
  /** How a section enters: the motion primitives read this. */
  enter: "mask" | "blur" | "step" | "fade";
  /** Marquee speed in px per second. */
  marquee: number;
  /** Hover lift in px; brutal translates diagonally instead. */
  lift: number;
  /** Card tilt in degrees, 0 turns TiltCard into a no-op. */
  tilt: number;
};

export type DirectionSpec = {
  key: Direction;
  label: string;
  /** One sentence for design-kit/README.md and preview/summary.md. */
  signature: string;
  color: ColorRecipe;
  radius: RadiusRamp;
  shadow: ShadowRecipe;
  /** Border widths: brutal draws thick, editorial draws hairlines. */
  stroke: { base: string; strong: string };
  type: Record<TypeToken, TypeStep>;
  /** Vertical rhythm between sections and between blocks inside one. */
  rhythm: { section: string; block: string };
  containers: { prose: string; content: string; wide: string };
  motion: MotionRecipe;
};
