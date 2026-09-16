/**
 * Every design token, as data.
 *
 * `scripts/brand-gen.ts` serialises this into `src/app/brand.generated.css`;
 * the OG routes, the icon, the manifest, the email renderer and the motion
 * primitives read the same object, so a pixel in an OG card and a pixel in the
 * page can never disagree about what "accent" means.
 *
 * Pure apart from the `brand` import at the bottom: `buildTokens` takes any
 * brand, which is what `scripts/preview-directions.mjs` needs.
 */
import brand from "../brand";
import {
  COLOR_TOKENS,
  buildRamp,
  contrastFailures,
  css,
  measureContrast,
  toHex,
  type ColorToken,
  type ContrastReport,
  type Ramp,
} from "./color";
import { DIRECTION_SPECS, TYPE_TOKENS, type DirectionSpec, type TypeToken } from "./directions";
import { FONT_LOADERS, FONT_VARIABLES, fontStack } from "./fonts";
import type { Brand, Direction, FontKey, MotionIntensity, Scheme } from "./types";

export { COLOR_TOKENS, TYPE_TOKENS };
export type { ColorToken, TypeToken };

/** Motion intensity scales distance and pointer effects, never duration. */
const INTENSITY_SCALE: Record<MotionIntensity, number> = { calm: 0.6, lively: 1, bold: 1.3 };

export const EASINGS = {
  "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
  "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  step: "steps(5, end)",
} as const;
export type EasingKey = keyof typeof EASINGS;

export type TypeTokenValue = {
  size: string;
  leading: string;
  tracking: string;
  weight: number;
  family: "display" | "body" | "mono";
  transform?: "uppercase";
};

export type MotionTokens = {
  /** Five steps in ms, already multiplied by `brand.motion.durationScale`. */
  durations: [number, number, number, number, number];
  easings: Record<EasingKey, string>;
  /** How far a reveal travels, in px. */
  distance: number;
  /** Default easing for a reveal in this direction. */
  reveal: EasingKey;
  /** How a section enters. */
  enter: "mask" | "blur" | "step" | "fade";
  marquee: number;
  lift: number;
  tilt: number;
  intensity: MotionIntensity;
  scale: number;
};

export type SchemeTokens = {
  ramp: Ramp;
  /** CSS colour strings, keyed by token. */
  colors: Record<ColorToken, string>;
  /** Flat hex for OG images, email and the manifest. */
  hex: Record<ColorToken, string>;
  shadowTints: { weak: string; base: string; strong: string; glow: string };
  contrast: ContrastReport;
};

export type Tokens = {
  brand: Brand;
  direction: DirectionSpec;
  schemes: Record<Scheme, SchemeTokens>;
  /** The brand's own scheme, resolved. */
  active: SchemeTokens;
  radius: Record<"sm" | "md" | "lg" | "xl" | "2xl" | "input", string>;
  stroke: { base: string; strong: string };
  shadows: Record<"1" | "2" | "3" | "4" | "hard" | "glow", string>;
  type: Record<TypeToken, TypeTokenValue>;
  rhythm: { section: string; block: string };
  containers: { prose: string; content: string; wide: string };
  motion: MotionTokens;
  fonts: {
    keys: { display: FontKey; body: FontKey; mono: FontKey };
    /** Full CSS font stacks for `--font-display`, `--font-body`, `--font-mono`. */
    stacks: { display: string; body: string; mono: string };
    /** Vendored TTF filenames for the OG and icon routes. */
    ogFiles: { display: string; body: string; mono: string };
  };
};

function shadowTint(scheme: Scheme, alpha: number, hue: number, chroma: number): string {
  return scheme === "dark"
    ? css({ color: { l: 0.04, c: chroma * 0.6, h: hue }, alpha })
    : css({ color: { l: 0.44, c: chroma, h: hue }, alpha });
}

function buildSchemeTokens(brandValue: Brand, spec: DirectionSpec, scheme: Scheme): SchemeTokens {
  const ramp = buildRamp({
    scheme,
    recipe: spec.color,
    accentHue: brandValue.palette.accentHue,
    accentChroma: brandValue.palette.accentChroma,
    neutrals: brandValue.palette.neutrals,
  });

  const colors = {} as Record<ColorToken, string>;
  const hex = {} as Record<ColorToken, string>;
  for (const token of COLOR_TOKENS) {
    colors[token] = css(ramp[token]);
    hex[token] = toHex(ramp[token].color);
  }

  const alphas = scheme === "dark" ? spec.shadow.alphaDark : spec.shadow.alphaLight;
  const neutralHue = ramp.canvas.color.h;
  const neutralChroma = Math.max(ramp.canvas.color.c, 0.004);

  return {
    ramp,
    colors,
    hex,
    shadowTints: {
      weak: shadowTint(scheme, alphas[0], neutralHue, neutralChroma),
      base: shadowTint(scheme, alphas[1], neutralHue, neutralChroma),
      strong: shadowTint(scheme, alphas[2], neutralHue, neutralChroma),
      glow:
        spec.shadow.glowAlpha > 0
          ? css({ color: ramp.accent.color, alpha: spec.shadow.glowAlpha })
          : "transparent",
    },
    contrast: measureContrast(ramp),
  };
}

function buildShadows(spec: DirectionSpec): Tokens["shadows"] {
  const s = spec.shadow.spread;
  const px = (value: number): string => `${Math.round(value * s)}px`;
  return {
    "1": `0 1px 2px -1px var(--shadow-tint-weak), 0 1px 1px var(--shadow-tint-weak)`,
    "2": `0 2px 4px -2px var(--shadow-tint-weak), 0 ${px(6)} ${px(12)} -4px var(--shadow-tint)`,
    "3": `0 4px 8px -4px var(--shadow-tint), 0 ${px(16)} ${px(28)} -8px var(--shadow-tint)`,
    "4": `0 8px 16px -8px var(--shadow-tint), 0 ${px(32)} ${px(56)} -16px var(--shadow-tint-strong)`,
    hard:
      spec.shadow.hardOffset > 0
        ? `${spec.shadow.hardOffset}px ${spec.shadow.hardOffset}px 0 0 var(--color-line-strong)`
        : `0 0 0 1px var(--color-line-strong)`,
    glow:
      spec.shadow.glowAlpha > 0
        ? `0 0 0 1px var(--color-accent-soft), 0 ${px(18)} ${px(48)} -12px var(--shadow-glow-tint)`
        : `0 0 0 1px var(--color-line)`,
  };
}

function buildType(spec: DirectionSpec): Record<TypeToken, TypeTokenValue> {
  const out = {} as Record<TypeToken, TypeTokenValue>;
  for (const token of TYPE_TOKENS) {
    const step = spec.type[token];
    const size = step.min === step.max ? step.min : `clamp(${step.min}, ${step.fluid}, ${step.max})`;
    out[token] = {
      size,
      leading: step.leading,
      tracking: step.tracking,
      weight: step.weight,
      family: step.family,
      ...(step.transform ? { transform: step.transform } : {}),
    };
  }
  return out;
}

/** Every token for one brand. Deterministic: same brand in, same CSS out. */
export function buildTokens(brandValue: Brand): Tokens {
  const spec = DIRECTION_SPECS[brandValue.direction];
  const scale = INTENSITY_SCALE[brandValue.motion.intensity];
  const durationScale = brandValue.motion.durationScale;
  const durations = spec.motion.durations.map((ms) => Math.round(ms * durationScale)) as [
    number,
    number,
    number,
    number,
    number,
  ];

  const schemes: Record<Scheme, SchemeTokens> = {
    dark: buildSchemeTokens(brandValue, spec, "dark"),
    light: buildSchemeTokens(brandValue, spec, "light"),
  };

  return {
    brand: brandValue,
    direction: spec,
    schemes,
    active: schemes[brandValue.scheme],
    radius: { ...spec.radius },
    stroke: { ...spec.stroke },
    shadows: buildShadows(spec),
    type: buildType(spec),
    rhythm: { ...spec.rhythm },
    containers: { ...spec.containers },
    motion: {
      durations,
      easings: { ...EASINGS },
      distance: Math.round(spec.motion.distance * scale),
      reveal: spec.motion.reveal,
      enter: spec.motion.enter,
      marquee: Math.round(spec.motion.marquee * scale),
      lift: Math.round(spec.motion.lift * scale * 10) / 10,
      tilt: Math.round(spec.motion.tilt * scale * 10) / 10,
      intensity: brandValue.motion.intensity,
      scale,
    },
    fonts: {
      keys: { ...brandValue.type },
      stacks: {
        display: fontStack(brandValue.type.display, FONT_VARIABLES.display),
        body: fontStack(brandValue.type.body, FONT_VARIABLES.body),
        mono: fontStack(brandValue.type.mono, FONT_VARIABLES.mono),
      },
      ogFiles: {
        display: FONT_LOADERS[brandValue.type.display].ogFile,
        body: FONT_LOADERS[brandValue.type.body].ogFile,
        mono: FONT_LOADERS[brandValue.type.mono].ogFile,
      },
    },
  };
}

/** Contrast failures across both schemes, as sentences. Empty means shippable. */
export function tokenContrastFailures(tokens: Tokens): string[] {
  return [
    ...contrastFailures(tokens.schemes.dark.ramp).map((line) => `dark: ${line}`),
    ...contrastFailures(tokens.schemes.light.ramp).map((line) => `light: ${line}`),
  ];
}

/** Human labels, used by the preview summary and design-kit/README.md. */
export const DIRECTION_LABELS: Record<Direction, string> = {
  editorial: DIRECTION_SPECS.editorial.label,
  luminous: DIRECTION_SPECS.luminous.label,
  brutal: DIRECTION_SPECS.brutal.label,
  craft: DIRECTION_SPECS.craft.label,
};

/** The tokens of the brand this repo is currently building. */
export const tokens: Tokens = buildTokens(brand);
