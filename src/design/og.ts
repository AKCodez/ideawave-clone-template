/**
 * Everything the generated brand assets share: the sizes, the vendored font
 * files, and the one place that reads bytes off disk.
 *
 * Why `process.cwd()` and not `import.meta.url`: the OG, twitter and icon
 * routes are bundled into `.next/server/app/...` chunks, so a path resolved
 * from `import.meta.url` points at the chunk, not at `src/design/og-fonts`.
 * Next's `outputFileTracingIncludes` (see next.config.ts) copies the TTFs into
 * the function preserving their project-relative path, and the function runs
 * with its own root as the working directory - so `process.cwd()` is the only
 * base that is correct both in `next dev` and on Vercel.
 *
 * Nothing here throws. A missing font file degrades to "render with whatever
 * font @vercel/og ships with", because a 500 on /opengraph-image costs more
 * than an off-brand card.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FONT_LOADERS } from "./fonts";
import { tokens } from "./tokens";
import { FONT_META } from "./types";

/** Open Graph and Twitter cards. The size every scraper expects. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** The only icon this app ships. There is no favicon.ico. */
export const ICON_SIZE = { width: 32, height: 32 } as const;

/** Body copy in every OG card, whatever the brand's display face is. */
export const OG_TEXT_FILE = "geist-500.ttf";
const OG_TEXT_FAMILY = "Geist";
const OG_TEXT_WEIGHT = 500;

/** Where the vendored latin TTFs live, relative to the repo root. */
export const OG_FONT_DIR = join("src", "design", "og-fonts");

/** Weights satori accepts. */
export type OgFontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/** One face, in the shape `ImageResponse`'s `fonts` option wants. */
export type OgFontFace = {
  name: string;
  data: ArrayBuffer;
  weight: OgFontWeight;
  style: "normal";
};

export type OgFonts = {
  /** The brand's display face, or null when its file could not be read. */
  display: OgFontFace | null;
  /** Geist 500, the body face of every card. */
  text: OgFontFace | null;
  /** What to put in `fontFamily` for headlines. */
  displayFamily: string;
  /** What to put in `fontFamily` for body copy. */
  textFamily: string;
  /** Pass straight to `ImageResponse`. `undefined` means "use the built-in font". */
  faces: OgFontFace[] | undefined;
};

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function asWeight(value: number): OgFontWeight {
  const rounded = Math.round(value / 100) * 100;
  const clamped = Math.min(900, Math.max(100, rounded));
  return clamped as OgFontWeight;
}

/** Reads one vendored TTF. Returns null instead of throwing when it is absent. */
function readFace(file: string, name: string, weight: number): OgFontFace | null {
  try {
    const bytes = readFileSync(join(process.cwd(), OG_FONT_DIR, file));
    if (bytes.byteLength === 0) return null;
    return { name, data: toArrayBuffer(bytes), weight: asWeight(weight), style: "normal" };
  } catch {
    console.warn(`[og] vendored font ${file} is missing - rendering without it`);
    return null;
  }
}

let cached: OgFonts | null = null;

/**
 * The display face named by `tokens.fonts.ogFile` plus the shared text face,
 * read once per process and reused by every card.
 */
export function loadOgFonts(): OgFonts {
  if (cached) return cached;

  const displayKey = tokens.fonts.keys.display;
  const loader = FONT_LOADERS[displayKey];
  const display = readFace(tokens.fonts.ogFile, FONT_META[displayKey].family, loader.ogWeight);
  const text = readFace(OG_TEXT_FILE, OG_TEXT_FAMILY, OG_TEXT_WEIGHT);

  const faces = [display, text].filter((face): face is OgFontFace => face !== null);
  const textFamily = text ? OG_TEXT_FAMILY : (display?.name ?? OG_TEXT_FAMILY);

  cached = {
    display,
    text,
    displayFamily: display ? display.name : textFamily,
    textFamily,
    faces: faces.length > 0 ? faces : undefined,
  };
  return cached;
}

/** Test seam: forget the cached read. Never needed at runtime. */
export function resetOgFontCache(): void {
  cached = null;
}
