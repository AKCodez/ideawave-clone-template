/**
 * What each font key needs in order to load: the `next/font/google` export
 * name, explicit weights for the faces that are not variable, the fallback
 * stack, and the vendored TTF that the OG and icon routes read at runtime.
 *
 * `scripts/brand-gen.ts` turns three of these into `src/design/fonts.generated.ts`,
 * which is the only file that may call a font loader.
 */
import { FONT_META, type FontClass, type FontKey } from "./types";

export type FontLoader = {
  /** The named export of `next/font/google`. */
  importName: string;
  /** Only for static families; variable families omit it. */
  weights?: string[];
  /** Filename under `src/design/og-fonts/`, latin subset, used by OG and icon. */
  ogFile: string;
  /** Weight the OG font file carries, so layouts can pick a matching face. */
  ogWeight: number;
};

const FALLBACKS: Record<FontClass, string> = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

export const FONT_LOADERS: Record<FontKey, FontLoader> = {
  "instrument-serif": { importName: "Instrument_Serif", weights: ["400"], ogFile: "instrument-serif-400.ttf", ogWeight: 400 },
  fraunces: { importName: "Fraunces", ogFile: "fraunces-600.ttf", ogWeight: 600 },
  "inter-tight": { importName: "Inter_Tight", ogFile: "inter-tight-500.ttf", ogWeight: 500 },
  "jetbrains-mono": { importName: "JetBrains_Mono", ogFile: "jetbrains-mono-400.ttf", ogWeight: 400 },
  "space-grotesk": { importName: "Space_Grotesk", ogFile: "space-grotesk-600.ttf", ogWeight: 600 },
  geist: { importName: "Geist", ogFile: "geist-600.ttf", ogWeight: 600 },
  "geist-mono": { importName: "Geist_Mono", ogFile: "geist-mono-400.ttf", ogWeight: 400 },
  "bricolage-grotesque": { importName: "Bricolage_Grotesque", ogFile: "bricolage-grotesque-800.ttf", ogWeight: 800 },
  unbounded: { importName: "Unbounded", ogFile: "unbounded-800.ttf", ogWeight: 800 },
  manrope: { importName: "Manrope", ogFile: "manrope-500.ttf", ogWeight: 500 },
  newsreader: { importName: "Newsreader", ogFile: "newsreader-500.ttf", ogWeight: 500 },
  cormorant: { importName: "Cormorant_Garamond", weights: ["300", "400", "500", "600", "700"], ogFile: "cormorant-600.ttf", ogWeight: 600 },
  "dm-sans": { importName: "DM_Sans", ogFile: "dm-sans-500.ttf", ogWeight: 500 },
  "ibm-plex-mono": { importName: "IBM_Plex_Mono", weights: ["400", "500", "600"], ogFile: "ibm-plex-mono-400.ttf", ogWeight: 400 },
};

/** `"Instrument Serif", Georgia, serif` - what a `--font-*` token resolves to. */
export function fontStack(key: FontKey, variable: string): string {
  return `var(${variable}), ${FONT_META[key].family.includes(" ") ? `"${FONT_META[key].family}"` : FONT_META[key].family}, ${FALLBACKS[FONT_META[key].class]}`;
}

/** The CSS variable each slot binds its loaded face to. */
export const FONT_VARIABLES = {
  display: "--font-display-face",
  body: "--font-body-face",
  mono: "--font-mono-face",
} as const;
