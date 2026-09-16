/* GENERATED FILE - do not edit src/design/fonts.generated.ts by hand.
   Written by scripts/brand-gen.ts from src/brand.ts.
   Brand: Clone Kit - editorial / dark - accent hue 48.
   Change src/brand.ts and run `npm run brand:gen`. */
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";

/** display: Instrument Serif (instrument-serif). */
export const displayFont = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display-face",
  display: "swap",
  preload: true,
});

/** body: Inter Tight (inter-tight). */
export const bodyFont = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
  preload: true,
});

/** mono: JetBrains Mono (jetbrains-mono). Not preloaded: numbers only. */
export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
  preload: false,
});

/** Every face's CSS variable, for the <html> className. */
export const fontVariables: string = [displayFont.variable, bodyFont.variable, monoFont.variable].join(" ");
