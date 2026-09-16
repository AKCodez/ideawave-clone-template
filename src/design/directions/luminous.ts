import type { DirectionSpec } from "./spec";

/**
 * Luminous: a product keynote. Deep blue-black, geometric sans, large soft
 * corners, glass surfaces lit from behind, and springs. Motion blurs in and
 * settles. This is the direction that looks like a launch video.
 */
export const luminous: DirectionSpec = {
  key: "luminous",
  label: "Luminous",
  signature:
    "A launch keynote: deep space canvas, geometric sans, big soft corners, glowing glass panels and springy motion.",
  color: {
    accentChromaScale: 1.1,
    neutralChromaScale: 1.15,
    dark: {
      canvasL: 0.14,
      surfaceDelta: 0.055,
      elevatedDelta: 0.105,
      lineDelta: 0.15,
      lineStrongDelta: 0.27,
      inkL: 0.975,
      mutedStart: 0.72,
      faintStart: 0.58,
      accentStart: 0.72,
      accentHoverDelta: 0.07,
      softDelta: 0.11,
      softChroma: 0.5,
      overlayL: 0.06,
      overlayAlpha: 0.75,
    },
    light: {
      canvasL: 0.974,
      surfaceDelta: 0.02,
      elevatedDelta: 0.026,
      lineDelta: -0.108,
      lineStrongDelta: -0.29,
      inkL: 0.18,
      mutedStart: 0.5,
      faintStart: 0.64,
      accentStart: 0.56,
      accentHoverDelta: -0.06,
      softDelta: -0.042,
      softChroma: 0.34,
      overlayL: 0.22,
      overlayAlpha: 0.6,
    },
  },
  radius: { sm: "0.5rem", md: "0.75rem", lg: "1.125rem", xl: "1.5rem", "2xl": "2rem", input: "0.75rem" },
  shadow: { alphaDark: [0.35, 0.48, 0.62], alphaLight: [0.06, 0.1, 0.16], spread: 1.45, hardOffset: 0, glowAlpha: 0.45 },
  stroke: { base: "1px", strong: "1.5px" },
  type: {
    display: { min: "2.875rem", fluid: "1.6rem + 5.6vw", max: "5.25rem", leading: "0.98", tracking: "-0.04em", weight: 600, family: "display" },
    h1: { min: "2.25rem", fluid: "1.45rem + 3.3vw", max: "3.5rem", leading: "1.05", tracking: "-0.035em", weight: 600, family: "display" },
    h2: { min: "1.75rem", fluid: "1.3rem + 1.9vw", max: "2.5rem", leading: "1.14", tracking: "-0.028em", weight: 600, family: "display" },
    h3: { min: "1.1875rem", fluid: "1.05rem + 0.75vw", max: "1.5rem", leading: "1.3", tracking: "-0.018em", weight: 600, family: "display" },
    lead: { min: "1.0625rem", fluid: "1rem + 0.55vw", max: "1.375rem", leading: "1.62", tracking: "-0.01em", weight: 400, family: "body" },
    body: { min: "1rem", fluid: "1rem", max: "1rem", leading: "1.68", tracking: "-0.005em", weight: 400, family: "body" },
    small: { min: "0.875rem", fluid: "0.875rem", max: "0.875rem", leading: "1.55", tracking: "0em", weight: 400, family: "body" },
    caption: { min: "0.75rem", fluid: "0.75rem", max: "0.75rem", leading: "1.4", tracking: "0.01em", weight: 500, family: "body" },
  },
  rhythm: { section: "clamp(5rem, 3.25rem + 7vw, 9rem)", block: "clamp(2rem, 1.4rem + 1.8vw, 3rem)" },
  containers: { prose: "40rem", content: "68rem", wide: "84rem" },
  motion: { durations: [120, 200, 340, 480, 700], distance: 24, reveal: "spring", enter: "blur", marquee: 55, lift: 3, tilt: 6 },
};
