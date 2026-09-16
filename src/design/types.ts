/**
 * The Clone Studio <-> template contract (KIT_CONTRACT_VERSION).
 *
 * Mirrored verbatim from IdeaWave's `src/lib/clone/kit.ts`. IdeaWave writes
 * `src/brand.ts` into every build from a `Brand`; `scripts/design-check.mjs`
 * validates that file here with the same rules, so drift between the two repos
 * fails inside the sandbox at verify, before a member ever sees it.
 *
 * This module is dependency-free on purpose: `src/brand.ts`, the generator
 * scripts and client components all import it.
 */

export const KIT_CONTRACT_VERSION = "0.2.0";

export const DIRECTIONS = ["editorial", "luminous", "brutal", "craft"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const SCHEMES = ["dark", "light"] as const;
export type Scheme = (typeof SCHEMES)[number];

export const FONT_KEYS = [
  "instrument-serif",
  "fraunces",
  "inter-tight",
  "jetbrains-mono",
  "space-grotesk",
  "geist",
  "geist-mono",
  "bricolage-grotesque",
  "unbounded",
  "manrope",
  "newsreader",
  "cormorant",
  "dm-sans",
  "ibm-plex-mono",
] as const;
export type FontKey = (typeof FONT_KEYS)[number];
export type FontClass = "serif" | "sans" | "mono";

/** Google Fonts family names per key, and the class used by the distinctness rules. */
export const FONT_META: Record<FontKey, { family: string; class: FontClass }> = {
  "instrument-serif": { family: "Instrument Serif", class: "serif" },
  fraunces: { family: "Fraunces", class: "serif" },
  "inter-tight": { family: "Inter Tight", class: "sans" },
  "jetbrains-mono": { family: "JetBrains Mono", class: "mono" },
  "space-grotesk": { family: "Space Grotesk", class: "sans" },
  geist: { family: "Geist", class: "sans" },
  "geist-mono": { family: "Geist Mono", class: "mono" },
  "bricolage-grotesque": { family: "Bricolage Grotesque", class: "sans" },
  unbounded: { family: "Unbounded", class: "sans" },
  manrope: { family: "Manrope", class: "sans" },
  newsreader: { family: "Newsreader", class: "serif" },
  cormorant: { family: "Cormorant Garamond", class: "serif" },
  "dm-sans": { family: "DM Sans", class: "sans" },
  "ibm-plex-mono": { family: "IBM Plex Mono", class: "mono" },
};

/** The pairs each art direction may use; the display slot has two options so a
 *  brand can always differ from the target's face without leaving the direction. */
export const DIRECTION_FONTS: Record<
  Direction,
  { display: readonly FontKey[]; body: readonly FontKey[]; mono: readonly FontKey[] }
> = {
  editorial: { display: ["instrument-serif", "fraunces"], body: ["inter-tight"], mono: ["jetbrains-mono"] },
  luminous: { display: ["space-grotesk", "geist"], body: ["geist"], mono: ["geist-mono"] },
  brutal: { display: ["bricolage-grotesque", "unbounded"], body: ["manrope"], mono: ["jetbrains-mono"] },
  craft: { display: ["newsreader", "cormorant"], body: ["dm-sans"], mono: ["ibm-plex-mono"] },
};

/** Section components the template ships; a spec may only compose pages from these. */
export const KIT_SECTIONS = [
  "Hero",
  "ProductFrame",
  "Bento",
  "Steps",
  "Stats",
  "Compare",
  "Pricing",
  "Faq",
  "CtaBand",
  "Footer",
  "SiteHeader",
] as const;
export type KitSection = (typeof KIT_SECTIONS)[number];

export const MOTION_PRIMITIVES = [
  "Reveal",
  "Stagger",
  "SplitText",
  "Parallax",
  "ScrollProgress",
  "Marquee",
  "Counter",
  "Magnetic",
  "Spotlight",
  "TiltCard",
  "PageTransition",
  "AuroraMesh",
  "Grain",
] as const;

/** The demo member every preview seeds; the theater and the audit sign in with it. */
export const DEMO_LOGIN = { email: "demo@example.com", password: "demo-pass-1234" } as const;

export type WordmarkCase = "lower" | "title" | "upper";
export type WordmarkTracking = "tight" | "normal" | "wide";
export type WordmarkWeight = 500 | 600 | 700 | 800;
export type MonogramShape = "circle" | "square" | "rounded" | "hexagon";
export type Neutrals = "warm" | "cool" | "neutral";
export type MotionIntensity = "calm" | "lively" | "bold";

/**
 * `src/brand.ts` in a build: data only, no logic, validated identically on both
 * sides of the contract. Every token in `src/design/` is derived from it.
 */
export type Brand = {
  /** 2-24 characters. The product's name, everywhere. */
  name: string;
  /** Up to 80 characters. One sentence, sits under the wordmark. */
  tagline: string;
  wordmark: {
    case: WordmarkCase;
    tracking: WordmarkTracking;
    weight: WordmarkWeight;
    monogram: { letters: string; shape: MonogramShape };
  };
  direction: Direction;
  scheme: Scheme;
  palette: {
    /** 0-360. The accent's OKLCH hue. */
    accentHue: number;
    /** 0.06-0.30. The accent's OKLCH chroma before gamut clipping. */
    accentChroma: number;
    neutrals: Neutrals;
  };
  type: { display: FontKey; body: FontKey; mono: FontKey };
  motion: {
    intensity: MotionIntensity;
    /** 0.7-1.4. Multiplies every duration token. */
    durationScale: number;
  };
  voice: { adjectives: string[]; phrases: string[]; avoid: string[] };
  imagery: { rules: string[] };
  credit: { startupUrl: string; builtInMinutes: number | null };
  meta: { generator: "ideawave-clone-studio"; version: 1; buildId: string };
};

/** Which slots of a type pairing fall outside the direction's allowed fonts. */
export function fontIssues(
  direction: Direction,
  type: { display: FontKey; body: FontKey; mono: FontKey },
): { slot: "display" | "body" | "mono"; message: string }[] {
  const allowed = DIRECTION_FONTS[direction];
  const issues: { slot: "display" | "body" | "mono"; message: string }[] = [];
  for (const slot of ["display", "body", "mono"] as const) {
    if (!allowed[slot].includes(type[slot])) {
      issues.push({
        slot,
        message: `${type[slot]} is not a ${slot} font of the ${direction} direction (${allowed[slot].join(", ")})`,
      });
    }
  }
  return issues;
}
