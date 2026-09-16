/**
 * Colour maths for the token generator. Pure, dependency-free and tested
 * (`src/design/color.test.ts`): OKLCH to sRGB, WCAG contrast, gamut clipping,
 * and the solver that guarantees the four contrast floors the kit promises.
 *
 * Nothing here reads `src/brand.ts` or the DOM, so IdeaWave vendors this file
 * to check a generated brand before a build ever starts.
 */

export type Oklch = { l: number; c: number; h: number };
export type Rgb = { r: number; g: number; b: number };

/** The 17 semantic colours every scheme defines. */
export const COLOR_TOKENS = [
  "canvas",
  "surface",
  "elevated",
  "overlay",
  "line",
  "line-strong",
  "ink",
  "muted",
  "faint",
  "accent",
  "accent-hover",
  "accent-soft",
  "on-accent",
  "positive",
  "warning",
  "critical",
  "focus",
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/** A resolved colour: an OKLCH triple plus an optional alpha for scrims. */
export type Swatch = { color: Oklch; alpha?: number };
export type Ramp = Record<ColorToken, Swatch>;

/** The floors asserted at generation. Failing any of them fails `brand:gen`. */
export const CONTRAST_FLOORS = {
  inkOnCanvas: 12,
  mutedOnSurface: 4.6,
  accentOnCanvas: 3,
  onAccentOnAccent: 4.5,
  statusOnSurface: 4.5,
  focusOnCanvas: 3,
} as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const round = (value: number, places: number): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};
/** Rounds down, so a rounded chroma can never land back outside the gamut. */
const roundDownTo = (value: number, places: number): number => {
  const factor = 10 ** places;
  return Math.floor(value * factor) / factor;
};

/** Hue in degrees, normalised to [0, 360). */
export function normalizeHue(hue: number): number {
  const wrapped = hue % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Shortest angular distance between two hues, 0-180. */
export function hueDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeHue(a) - normalizeHue(b));
  return diff > 180 ? 360 - diff : diff;
}

function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** OKLCH to gamma-encoded sRGB in 0-1. Values outside 0-1 are out of gamut. */
export function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const radians = (normalizeHue(h) * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);

  const lp = l + 0.3963377774 * a + 0.2158037573 * b;
  const mp = l - 0.1055613458 * a - 0.0638541728 * b;
  const sp = l - 0.0894841775 * a - 1.291485548 * b;

  const lc = lp * lp * lp;
  const mc = mp * mp * mp;
  const sc = sp * sp * sp;

  return {
    r: linearToSrgb(4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc),
    g: linearToSrgb(-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc),
    b: linearToSrgb(-0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc),
  };
}

const EPSILON = 0.0005;

/** True when every channel lands inside the sRGB cube. */
export function inGamut(rgb: Rgb): boolean {
  return (
    rgb.r >= -EPSILON && rgb.r <= 1 + EPSILON &&
    rgb.g >= -EPSILON && rgb.g <= 1 + EPSILON &&
    rgb.b >= -EPSILON && rgb.b <= 1 + EPSILON
  );
}

/**
 * Keep the lightness and hue, drop chroma until the colour fits sRGB. A binary
 * search rather than a step loop so the result is stable across platforms.
 */
export function clipToGamut(color: Oklch): Oklch {
  const normalized: Oklch = { l: clamp(color.l, 0, 1), c: Math.max(0, color.c), h: normalizeHue(color.h) };
  if (inGamut(oklchToRgb(normalized))) return normalized;

  let low = 0;
  let high = normalized.c;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (inGamut(oklchToRgb({ ...normalized, c: mid }))) low = mid;
    else high = mid;
  }
  return { ...normalized, c: roundDownTo(low, 4) };
}

/** WCAG 2.1 relative luminance of a gamma-encoded sRGB colour. */
export function relativeLuminance(rgb: Rgb): number {
  const r = srgbToLinear(clamp(rgb.r, 0, 1));
  const g = srgbToLinear(clamp(rgb.g, 0, 1));
  const b = srgbToLinear(clamp(rgb.b, 0, 1));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque colours, 1-21. */
export function contrast(a: Oklch, b: Oklch): number {
  const la = relativeLuminance(oklchToRgb(a));
  const lb = relativeLuminance(oklchToRgb(b));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return round((lighter + 0.05) / (darker + 0.05), 2);
}

/** `#rrggbb`, for OG images and anywhere a CSS colour function is unavailable. */
export function toHex(color: Oklch): string {
  const rgb = oklchToRgb(clipToGamut(color));
  const channel = (value: number): string =>
    Math.round(clamp(value, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

/** `oklch(L C H)`, or `oklch(L C H / A)` when the swatch carries alpha. */
export function css({ color, alpha }: Swatch): string {
  const { l, c, h } = clipToGamut(color);
  const base = `${round(l, 4)} ${roundDownTo(c, 4)} ${round(h, 2)}`;
  return alpha === undefined ? `oklch(${base})` : `oklch(${base} / ${round(alpha, 3)})`;
}

export type SolveOptions = {
  hue: number;
  chroma: number;
  /** The background this colour must be legible on. */
  against: Oklch;
  /** Contrast floor to reach. */
  min: number;
  /** Where the search starts. */
  start: number;
  /** Which way lightness moves to gain contrast. */
  toward: "lighter" | "darker";
  /** Hard lightness bounds; the search stops there. */
  floor?: number;
  ceil?: number;
};

/**
 * Walk lightness in one direction until the colour clears `min` against its
 * background, clipping chroma to gamut at every step. Returns the best it found
 * even when the floor is unreachable, so the generator can report the real
 * number rather than silently shipping a washed-out token.
 */
export function solveLightness(options: SolveOptions): Oklch {
  const { hue, chroma, against, min, start, toward } = options;
  const floor = options.floor ?? 0.04;
  const ceil = options.ceil ?? 0.995;
  const step = 0.01;

  let best = clipToGamut({ l: clamp(start, floor, ceil), c: chroma, h: hue });
  let bestRatio = contrast(best, against);

  for (let l = clamp(start, floor, ceil); l >= floor && l <= ceil; l += toward === "lighter" ? step : -step) {
    const candidate = clipToGamut({ l, c: chroma, h: hue });
    const ratio = contrast(candidate, against);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= min) return candidate;
  }
  return best;
}

/** Nine swatches down one hue, for brand previews and the theater's reveal. */
export function oklchRamp(hue: number, chroma: number): Oklch[] {
  return [0.96, 0.88, 0.78, 0.68, 0.58, 0.48, 0.38, 0.26, 0.16].map((l) =>
    clipToGamut({ l, c: chroma * (l > 0.9 || l < 0.2 ? 0.55 : 1), h: hue }),
  );
}

export type NeutralKey = "warm" | "cool" | "neutral";

/** Hue and chroma of the neutral ramp. `neutral` borrows the accent's hue faintly. */
export function neutralAxis(neutrals: NeutralKey, accentHue: number): { hue: number; chroma: number } {
  if (neutrals === "warm") return { hue: 62, chroma: 0.012 };
  if (neutrals === "cool") return { hue: 258, chroma: 0.014 };
  return { hue: normalizeHue(accentHue), chroma: 0.004 };
}

/** Per-scheme shaping the art direction supplies to `buildRamp`. */
export type SchemeRecipe = {
  canvasL: number;
  surfaceDelta: number;
  elevatedDelta: number;
  lineDelta: number;
  lineStrongDelta: number;
  inkL: number;
  mutedStart: number;
  faintStart: number;
  accentStart: number;
  accentHoverDelta: number;
  softDelta: number;
  softChroma: number;
  overlayL: number;
  overlayAlpha: number;
};

export type ColorRecipe = {
  dark: SchemeRecipe;
  light: SchemeRecipe;
  accentChromaScale: number;
  neutralChromaScale: number;
};

export type RampInput = {
  scheme: "dark" | "light";
  recipe: ColorRecipe;
  accentHue: number;
  accentChroma: number;
  neutrals: NeutralKey;
};

const STATUS_HUES = { positive: 150, warning: 82, critical: 27 } as const;

/** Near-black or near-white ink, whichever reads better on this accent. */
function bestInkFor(accent: Oklch, hue: number, chroma: number): Oklch {
  const darkInk = solveLightness({
    hue,
    chroma: Math.min(chroma * 0.3, 0.05),
    against: accent,
    min: CONTRAST_FLOORS.onAccentOnAccent,
    start: 0.2,
    toward: "darker",
    floor: 0.02,
  });
  const lightInk = solveLightness({
    hue,
    chroma: Math.min(chroma * 0.16, 0.025),
    against: accent,
    min: CONTRAST_FLOORS.onAccentOnAccent,
    start: 0.95,
    toward: "lighter",
    ceil: 1,
  });
  return contrast(darkInk, accent) >= contrast(lightInk, accent) ? darkInk : lightInk;
}

export type AccentPair = { accent: Oklch; onAccent: Oklch };

/**
 * The accent and the ink that sits on it, solved together.
 *
 * Solving them separately fails for the hues that sit near mid-lightness in
 * sRGB - teal and lime - where neither black nor white clears 4.5:1 on the
 * first accent that clears 3:1 on the canvas. Pushing the accent further in the
 * direction it already moved satisfies both, and never costs canvas contrast.
 */
export function solveAccentPair(input: {
  hue: number;
  chroma: number;
  canvas: Oklch;
  start: number;
  toward: "lighter" | "darker";
}): AccentPair {
  const { hue, chroma, canvas, start, toward } = input;
  const direction = toward === "lighter" ? 0.01 : -0.01;

  const first = solveLightness({
    hue,
    chroma,
    against: canvas,
    min: CONTRAST_FLOORS.accentOnCanvas,
    start,
    toward,
  });

  let best: AccentPair = { accent: first, onAccent: bestInkFor(first, hue, chroma) };
  let bestRatio = contrast(best.onAccent, best.accent);

  for (let i = 1; i <= 45; i += 1) {
    const accent = clipToGamut({ l: clamp(first.l + direction * i, 0.05, 0.985), c: chroma, h: hue });
    if (contrast(accent, canvas) < CONTRAST_FLOORS.accentOnCanvas) continue;
    const onAccent = bestInkFor(accent, hue, chroma);
    const ratio = contrast(onAccent, accent);
    if (ratio >= CONTRAST_FLOORS.onAccentOnAccent) return { accent, onAccent };
    if (ratio > bestRatio) {
      best = { accent, onAccent };
      bestRatio = ratio;
    }
  }
  return best;
}

/**
 * The 17 semantic colours for one scheme. Neutrals come from the recipe's
 * lightness deltas; everything that carries text is solved against its own
 * background so the contrast floors hold for any accent hue the brand picks.
 */
export function buildRamp(input: RampInput): Ramp {
  const { scheme, recipe, accentHue, accentChroma, neutrals } = input;
  const dark = scheme === "dark";
  const shape = dark ? recipe.dark : recipe.light;
  const axis = neutralAxis(neutrals, accentHue);
  const nc = axis.chroma * recipe.neutralChromaScale;
  const nh = axis.hue;
  const ac = accentChroma * recipe.accentChromaScale;
  const toward = dark ? "lighter" : "darker";

  const neutral = (l: number, chromaScale = 1): Oklch =>
    clipToGamut({ l: clamp(l, 0, 1), c: nc * chromaScale, h: nh });

  const canvas = neutral(shape.canvasL);
  const surface = neutral(shape.canvasL + shape.surfaceDelta, 1.1);
  const elevated = neutral(shape.canvasL + shape.elevatedDelta, 1.2);
  const line = neutral(shape.canvasL + shape.lineDelta, 1.3);
  const lineStrong = neutral(shape.canvasL + shape.lineStrongDelta, 1.4);
  const ink = neutral(shape.inkL, 0.8);

  const muted = solveLightness({
    hue: nh,
    chroma: nc * 1.6,
    against: surface,
    min: CONTRAST_FLOORS.mutedOnSurface,
    start: shape.mutedStart,
    toward,
  });
  const faint = solveLightness({
    hue: nh,
    chroma: nc * 1.4,
    against: surface,
    min: 3,
    start: shape.faintStart,
    toward,
  });

  const { accent, onAccent } = solveAccentPair({
    hue: accentHue,
    chroma: ac,
    canvas,
    start: shape.accentStart,
    toward,
  });
  const accentHover = clipToGamut({
    l: clamp(accent.l + shape.accentHoverDelta, 0.05, 0.98),
    c: accent.c,
    h: accent.h,
  });
  const accentSoft = clipToGamut({
    l: clamp(shape.canvasL + shape.softDelta, 0, 1),
    c: ac * shape.softChroma,
    h: accentHue,
  });

  const status = (hue: number): Oklch =>
    solveLightness({
      hue,
      chroma: Math.max(0.1, Math.min(ac, 0.15)),
      against: surface,
      min: CONTRAST_FLOORS.statusOnSurface,
      start: dark ? 0.72 : 0.58,
      toward,
    });

  const focus = solveLightness({
    hue: accentHue,
    chroma: ac,
    against: canvas,
    min: CONTRAST_FLOORS.focusOnCanvas + 0.5,
    start: shape.accentStart,
    toward,
  });

  return {
    canvas: { color: canvas },
    surface: { color: surface },
    elevated: { color: elevated },
    overlay: { color: neutral(shape.overlayL, 1.2), alpha: shape.overlayAlpha },
    line: { color: line },
    "line-strong": { color: lineStrong },
    ink: { color: ink },
    muted: { color: muted },
    faint: { color: faint },
    accent: { color: accent },
    "accent-hover": { color: accentHover },
    "accent-soft": { color: accentSoft },
    "on-accent": { color: onAccent },
    positive: { color: status(STATUS_HUES.positive) },
    warning: { color: status(STATUS_HUES.warning) },
    critical: { color: status(STATUS_HUES.critical) },
    focus: { color: focus },
  };
}

export type ContrastReport = {
  inkOnCanvas: number;
  mutedOnSurface: number;
  accentOnCanvas: number;
  onAccentOnAccent: number;
  positiveOnSurface: number;
  warningOnSurface: number;
  criticalOnSurface: number;
  focusOnCanvas: number;
};

/** Every ratio the generator asserts, measured on a built ramp. */
export function measureContrast(ramp: Ramp): ContrastReport {
  return {
    inkOnCanvas: contrast(ramp.ink.color, ramp.canvas.color),
    mutedOnSurface: contrast(ramp.muted.color, ramp.surface.color),
    accentOnCanvas: contrast(ramp.accent.color, ramp.canvas.color),
    onAccentOnAccent: contrast(ramp["on-accent"].color, ramp.accent.color),
    positiveOnSurface: contrast(ramp.positive.color, ramp.surface.color),
    warningOnSurface: contrast(ramp.warning.color, ramp.surface.color),
    criticalOnSurface: contrast(ramp.critical.color, ramp.surface.color),
    focusOnCanvas: contrast(ramp.focus.color, ramp.canvas.color),
  };
}

/** Which floors a ramp misses, as sentences. Empty means the ramp is shippable. */
export function contrastFailures(ramp: Ramp): string[] {
  const report = measureContrast(ramp);
  const checks: [keyof ContrastReport, number, string][] = [
    ["inkOnCanvas", CONTRAST_FLOORS.inkOnCanvas, "ink on canvas"],
    ["mutedOnSurface", CONTRAST_FLOORS.mutedOnSurface, "muted on surface"],
    ["accentOnCanvas", CONTRAST_FLOORS.accentOnCanvas, "accent on canvas"],
    ["onAccentOnAccent", CONTRAST_FLOORS.onAccentOnAccent, "on-accent on accent"],
    ["positiveOnSurface", CONTRAST_FLOORS.statusOnSurface, "positive on surface"],
    ["warningOnSurface", CONTRAST_FLOORS.statusOnSurface, "warning on surface"],
    ["criticalOnSurface", CONTRAST_FLOORS.statusOnSurface, "critical on surface"],
    ["focusOnCanvas", CONTRAST_FLOORS.focusOnCanvas, "focus on canvas"],
  ];
  return checks
    .filter(([key, min]) => report[key] < min)
    .map(([key, min, label]) => `${label} is ${report[key]}:1, needs ${min}:1`);
}
