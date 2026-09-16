import type { DirectionSpec } from "./spec";

/**
 * Craft: a well-made book. Warm paper neutrals, a reading serif, medium
 * corners, shadows that read as a page lifting rather than a card floating, and
 * calm fades. The quiet direction; it earns trust instead of attention.
 */
export const craft: DirectionSpec = {
  key: "craft",
  label: "Craft",
  signature:
    "A well-made book: warm paper neutrals, a reading serif, medium corners, page-lift shadows and calm fades that never hurry.",
  color: {
    accentChromaScale: 0.85,
    neutralChromaScale: 1.6,
    dark: {
      canvasL: 0.175,
      surfaceDelta: 0.05,
      elevatedDelta: 0.095,
      lineDelta: 0.135,
      lineStrongDelta: 0.25,
      inkL: 0.955,
      mutedStart: 0.7,
      faintStart: 0.56,
      accentStart: 0.76,
      accentHoverDelta: 0.055,
      softDelta: 0.085,
      softChroma: 0.38,
      overlayL: 0.12,
      overlayAlpha: 0.7,
    },
    light: {
      canvasL: 0.963,
      surfaceDelta: 0.018,
      elevatedDelta: 0.03,
      lineDelta: -0.098,
      lineStrongDelta: -0.25,
      inkL: 0.235,
      mutedStart: 0.52,
      faintStart: 0.64,
      accentStart: 0.54,
      accentHoverDelta: -0.05,
      softDelta: -0.032,
      softChroma: 0.3,
      overlayL: 0.28,
      overlayAlpha: 0.55,
    },
  },
  radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", "2xl": "1.375rem", input: "0.5rem" },
  shadow: { alphaDark: [0.28, 0.38, 0.5], alphaLight: [0.055, 0.085, 0.13], spread: 1.15, hardOffset: 0, glowAlpha: 0 },
  stroke: { base: "1px", strong: "1.5px" },
  type: {
    display: { min: "2.5rem", fluid: "1.45rem + 4.8vw", max: "4.75rem", leading: "1.02", tracking: "-0.02em", weight: 500, family: "display" },
    h1: { min: "2rem", fluid: "1.35rem + 2.9vw", max: "3.25rem", leading: "1.08", tracking: "-0.018em", weight: 500, family: "display" },
    h2: { min: "1.5625rem", fluid: "1.2rem + 1.7vw", max: "2.25rem", leading: "1.18", tracking: "-0.014em", weight: 500, family: "display" },
    h3: { min: "1.1875rem", fluid: "1.05rem + 0.65vw", max: "1.4375rem", leading: "1.32", tracking: "-0.008em", weight: 600, family: "display" },
    lead: { min: "1.0625rem", fluid: "1rem + 0.5vw", max: "1.3125rem", leading: "1.68", tracking: "0em", weight: 400, family: "body" },
    body: { min: "1rem", fluid: "1rem", max: "1rem", leading: "1.72", tracking: "0em", weight: 400, family: "body" },
    small: { min: "0.875rem", fluid: "0.875rem", max: "0.875rem", leading: "1.6", tracking: "0em", weight: 400, family: "body" },
    caption: { min: "0.75rem", fluid: "0.75rem", max: "0.75rem", leading: "1.45", tracking: "0.03em", weight: 500, family: "body" },
  },
  rhythm: { section: "clamp(4.25rem, 3rem + 5.5vw, 7.5rem)", block: "clamp(1.75rem, 1.3rem + 1.5vw, 2.75rem)" },
  containers: { prose: "37rem", content: "62rem", wide: "78rem" },
  motion: { durations: [140, 220, 380, 560, 800], distance: 20, reveal: "out-soft", enter: "fade", marquee: 30, lift: 2, tilt: 4 },
};
