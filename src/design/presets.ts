/**
 * One complete brand per art direction, plus the two light-scheme variants.
 *
 * `scripts/preview-directions.mjs` writes each of these to `src/brand.ts`,
 * regenerates, builds and screenshots it. They are also the fastest way to see
 * what a direction does: `npm run brand:set luminous && npm run dev`.
 */
import type { Brand } from "./types";

const credit = { startupUrl: "https://ideawave.io", builtInMinutes: null } as const;
const meta = { generator: "ideawave-clone-studio", version: 1, buildId: "preset" } as const;

export const PRESETS = {
  editorial: {
    name: "Longform",
    tagline: "Turn one interview into a week of publishable writing.",
    wordmark: { case: "lower", tracking: "tight", weight: 500, monogram: { letters: "L", shape: "square" } },
    direction: "editorial",
    scheme: "dark",
    palette: { accentHue: 42, accentChroma: 0.15, neutrals: "warm" },
    type: { display: "instrument-serif", body: "inter-tight", mono: "jetbrains-mono" },
    motion: { intensity: "lively", durationScale: 1 },
    voice: {
      adjectives: ["considered", "literate", "unhurried"],
      phrases: [
        "One interview in, a week of writing out.",
        "Edit, then publish.",
        "Your voice, kept.",
        "Nothing is generated behind your back.",
        "Read it before anyone else does.",
      ],
      avoid: ["AI-powered", "revolutionary"],
    },
    imagery: { rules: ["Typography over photography", "Show real paragraphs, never lorem"] },
    credit,
    meta,
  },
  luminous: {
    name: "Flightdeck",
    tagline: "Every deploy, every incident, on one screen your team trusts.",
    wordmark: { case: "title", tracking: "tight", weight: 600, monogram: { letters: "FD", shape: "rounded" } },
    direction: "luminous",
    scheme: "dark",
    palette: { accentHue: 232, accentChroma: 0.19, neutrals: "cool" },
    type: { display: "space-grotesk", body: "geist", mono: "geist-mono" },
    motion: { intensity: "bold", durationScale: 1 },
    voice: {
      adjectives: ["precise", "calm", "fast"],
      phrases: [
        "One screen, the whole fleet.",
        "Know before the pager does.",
        "Green means green.",
        "Rollback is one keystroke.",
        "Built for the on-call hour.",
      ],
      avoid: ["synergy", "next-generation"],
    },
    imagery: { rules: ["Product frames over stock photos", "Charts show seeded data, never fake spikes"] },
    credit,
    meta,
  },
  brutal: {
    name: "Ledgerpunk",
    tagline: "Invoices that get paid, sent before you close the laptop.",
    wordmark: { case: "upper", tracking: "wide", weight: 800, monogram: { letters: "LP", shape: "square" } },
    direction: "brutal",
    scheme: "light",
    palette: { accentHue: 145, accentChroma: 0.2, neutrals: "neutral" },
    type: { display: "bricolage-grotesque", body: "manrope", mono: "jetbrains-mono" },
    motion: { intensity: "bold", durationScale: 0.9 },
    voice: {
      adjectives: ["blunt", "fast", "unfussy"],
      phrases: [
        "Send it. Get paid.",
        "No dashboard tourism.",
        "Late payers get chased automatically.",
        "One invoice, thirty seconds.",
        "Your money, on the front page.",
      ],
      avoid: ["solutions", "empower"],
    },
    imagery: { rules: ["Flat colour blocks, no gradients", "Screenshots at full contrast"] },
    credit,
    meta,
  },
  craft: {
    name: "Kilnhouse",
    tagline: "A quiet shop for makers who would rather be making.",
    wordmark: { case: "title", tracking: "normal", weight: 500, monogram: { letters: "K", shape: "circle" } },
    direction: "craft",
    scheme: "light",
    palette: { accentHue: 24, accentChroma: 0.13, neutrals: "warm" },
    type: { display: "newsreader", body: "dm-sans", mono: "ibm-plex-mono" },
    motion: { intensity: "calm", durationScale: 1.1 },
    voice: {
      adjectives: ["warm", "patient", "honest"],
      phrases: [
        "Listing a piece takes a minute.",
        "Your shop, not a marketplace.",
        "Photographs first, forms second.",
        "Nothing is listed until you say so.",
        "Made by hand, sold the same way.",
      ],
      avoid: ["disrupt", "scale"],
    },
    imagery: { rules: ["Texture and paper, never neon", "One object per frame"] },
    credit,
    meta,
  },
  "editorial-light": {
    name: "Longform",
    tagline: "Turn one interview into a week of publishable writing.",
    wordmark: { case: "lower", tracking: "tight", weight: 500, monogram: { letters: "L", shape: "square" } },
    direction: "editorial",
    scheme: "light",
    palette: { accentHue: 42, accentChroma: 0.15, neutrals: "warm" },
    type: { display: "fraunces", body: "inter-tight", mono: "jetbrains-mono" },
    motion: { intensity: "lively", durationScale: 1 },
    voice: {
      adjectives: ["considered", "literate", "unhurried"],
      phrases: [
        "One interview in, a week of writing out.",
        "Edit, then publish.",
        "Your voice, kept.",
        "Nothing is generated behind your back.",
        "Read it before anyone else does.",
      ],
      avoid: ["AI-powered", "revolutionary"],
    },
    imagery: { rules: ["Typography over photography", "Show real paragraphs, never lorem"] },
    credit,
    meta,
  },
  "luminous-light": {
    name: "Flightdeck",
    tagline: "Every deploy, every incident, on one screen your team trusts.",
    wordmark: { case: "title", tracking: "tight", weight: 600, monogram: { letters: "FD", shape: "rounded" } },
    direction: "luminous",
    scheme: "light",
    palette: { accentHue: 232, accentChroma: 0.19, neutrals: "cool" },
    type: { display: "geist", body: "geist", mono: "geist-mono" },
    motion: { intensity: "lively", durationScale: 1 },
    voice: {
      adjectives: ["precise", "calm", "fast"],
      phrases: [
        "One screen, the whole fleet.",
        "Know before the pager does.",
        "Green means green.",
        "Rollback is one keystroke.",
        "Built for the on-call hour.",
      ],
      avoid: ["synergy", "next-generation"],
    },
    imagery: { rules: ["Product frames over stock photos", "Charts show seeded data, never fake spikes"] },
    credit,
    meta,
  },
} as const satisfies Record<string, Brand>;

export type PresetKey = keyof typeof PRESETS;

export const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[];
