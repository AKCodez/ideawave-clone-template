import type { DirectionSpec } from "./spec";

/**
 * Editorial: a magazine. A serif display at a size nobody is brave enough to
 * use, hairline rules instead of boxes, near-square corners, and reveals that
 * wipe text up from behind a mask. The accent is a rule and an underline, not a
 * wash of colour.
 */
export const editorial: DirectionSpec = {
  key: "editorial",
  label: "Editorial",
  signature:
    "A magazine: oversized serif headlines, hairline rules, near-square corners, and text that wipes up from behind a mask.",
  color: {
    accentChromaScale: 0.95,
    neutralChromaScale: 1,
    dark: {
      canvasL: 0.155,
      surfaceDelta: 0.045,
      elevatedDelta: 0.09,
      lineDelta: 0.13,
      lineStrongDelta: 0.24,
      inkL: 0.965,
      mutedStart: 0.7,
      faintStart: 0.56,
      accentStart: 0.74,
      accentHoverDelta: 0.06,
      softDelta: 0.09,
      softChroma: 0.4,
      overlayL: 0.08,
      overlayAlpha: 0.72,
    },
    light: {
      canvasL: 0.972,
      surfaceDelta: 0.018,
      elevatedDelta: 0.026,
      lineDelta: -0.105,
      lineStrongDelta: -0.27,
      inkL: 0.2,
      mutedStart: 0.5,
      faintStart: 0.62,
      accentStart: 0.55,
      accentHoverDelta: -0.05,
      softDelta: -0.038,
      softChroma: 0.28,
      overlayL: 0.25,
      overlayAlpha: 0.55,
    },
  },
  radius: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem", xl: "0.5rem", "2xl": "0.75rem", input: "0.25rem" },
  shadow: { alphaDark: [0.3, 0.42, 0.55], alphaLight: [0.05, 0.08, 0.12], spread: 1, hardOffset: 3, glowAlpha: 0 },
  stroke: { base: "1px", strong: "2px" },
  type: {
    display: { min: "2.75rem", fluid: "1.5rem + 5.4vw", max: "5.75rem", leading: "0.96", tracking: "-0.035em", weight: 400, family: "display" },
    h1: { min: "2.125rem", fluid: "1.35rem + 3.4vw", max: "3.75rem", leading: "1.02", tracking: "-0.03em", weight: 400, family: "display" },
    h2: { min: "1.625rem", fluid: "1.2rem + 1.9vw", max: "2.5rem", leading: "1.1", tracking: "-0.025em", weight: 400, family: "display" },
    h3: { min: "1.1875rem", fluid: "1.05rem + 0.7vw", max: "1.5rem", leading: "1.25", tracking: "-0.015em", weight: 500, family: "body" },
    lead: { min: "1.0625rem", fluid: "1rem + 0.45vw", max: "1.3125rem", leading: "1.6", tracking: "-0.005em", weight: 400, family: "body" },
    body: { min: "1rem", fluid: "1rem", max: "1rem", leading: "1.65", tracking: "0em", weight: 400, family: "body" },
    small: { min: "0.875rem", fluid: "0.875rem", max: "0.875rem", leading: "1.55", tracking: "0em", weight: 400, family: "body" },
    caption: { min: "0.75rem", fluid: "0.75rem", max: "0.75rem", leading: "1.4", tracking: "0.04em", weight: 500, family: "body", transform: "uppercase" },
  },
  rhythm: { section: "clamp(4.5rem, 3rem + 6vw, 8rem)", block: "clamp(1.75rem, 1.25rem + 1.6vw, 2.75rem)" },
  containers: { prose: "38rem", content: "64rem", wide: "80rem" },
  motion: { durations: [140, 240, 420, 640, 900], distance: 32, reveal: "out-expo", enter: "mask", marquee: 40, lift: 0, tilt: 0 },
};
