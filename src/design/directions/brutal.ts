import type { DirectionSpec } from "./spec";

/**
 * Brutal: a poster. No corner radius anywhere, 2px rules, flat offset shadows
 * that move on press, uppercase display at the heaviest weight, and motion that
 * snaps in five steps instead of easing. Loud on purpose.
 */
export const brutal: DirectionSpec = {
  key: "brutal",
  label: "Brutal",
  signature:
    "A printed poster: zero radius, 2px rules, flat offset shadows that shift on press, heavy uppercase display and motion that snaps in steps.",
  color: {
    accentChromaScale: 1.3,
    neutralChromaScale: 0.6,
    dark: {
      canvasL: 0.125,
      surfaceDelta: 0.055,
      elevatedDelta: 0.1,
      lineDelta: 0.23,
      lineStrongDelta: 0.42,
      inkL: 0.985,
      mutedStart: 0.74,
      faintStart: 0.6,
      accentStart: 0.76,
      accentHoverDelta: 0.08,
      softDelta: 0.1,
      softChroma: 0.55,
      overlayL: 0.1,
      overlayAlpha: 0.82,
    },
    light: {
      canvasL: 0.995,
      surfaceDelta: -0.02,
      elevatedDelta: -0.045,
      lineDelta: -0.55,
      lineStrongDelta: -0.78,
      inkL: 0.14,
      mutedStart: 0.46,
      faintStart: 0.6,
      accentStart: 0.56,
      accentHoverDelta: -0.07,
      softDelta: -0.06,
      softChroma: 0.45,
      overlayL: 0.2,
      overlayAlpha: 0.72,
    },
  },
  radius: { sm: "0rem", md: "0rem", lg: "0rem", xl: "0rem", "2xl": "0rem", input: "0rem" },
  shadow: { alphaDark: [0.4, 0.55, 0.7], alphaLight: [0.1, 0.16, 0.24], spread: 0.6, hardOffset: 5, glowAlpha: 0 },
  stroke: { base: "2px", strong: "3px" },
  type: {
    display: { min: "2.75rem", fluid: "1.3rem + 6.2vw", max: "6rem", leading: "0.9", tracking: "-0.04em", weight: 800, family: "display", transform: "uppercase" },
    h1: { min: "2.125rem", fluid: "1.25rem + 3.8vw", max: "3.75rem", leading: "0.96", tracking: "-0.035em", weight: 800, family: "display", transform: "uppercase" },
    h2: { min: "1.625rem", fluid: "1.2rem + 2.1vw", max: "2.625rem", leading: "1.02", tracking: "-0.03em", weight: 700, family: "display", transform: "uppercase" },
    h3: { min: "1.125rem", fluid: "1rem + 0.7vw", max: "1.4375rem", leading: "1.2", tracking: "0.01em", weight: 700, family: "body", transform: "uppercase" },
    lead: { min: "1.0625rem", fluid: "1rem + 0.5vw", max: "1.3125rem", leading: "1.55", tracking: "0em", weight: 500, family: "body" },
    body: { min: "1rem", fluid: "1rem", max: "1rem", leading: "1.6", tracking: "0em", weight: 400, family: "body" },
    small: { min: "0.875rem", fluid: "0.875rem", max: "0.875rem", leading: "1.5", tracking: "0.005em", weight: 500, family: "body" },
    caption: { min: "0.75rem", fluid: "0.75rem", max: "0.75rem", leading: "1.35", tracking: "0.08em", weight: 700, family: "body", transform: "uppercase" },
  },
  rhythm: { section: "clamp(4rem, 2.75rem + 5vw, 7rem)", block: "clamp(1.5rem, 1.15rem + 1.4vw, 2.5rem)" },
  containers: { prose: "36rem", content: "66rem", wide: "82rem" },
  motion: { durations: [80, 140, 220, 320, 440], distance: 16, reveal: "step", enter: "step", marquee: 90, lift: 0, tilt: 0 },
};
