/**
 * The four Open Graph cards - one per art direction.
 *
 * These render inside satori, not in a browser. Satori supports a subset of
 * CSS, and three of its rules shape everything below:
 *
 *   1. Every element with more than one child needs an explicit `display: flex`.
 *   2. There is no grid, no CSS variable, no `@media`, no `filter: blur()`.
 *   3. Colours must be literal strings, so this file is the one place in the
 *      repo allowed to hold hex - and it still never writes one: every colour
 *      comes out of `tokens.active.hex`, and every size out of `tokens.brand`.
 *
 * Satori cannot blur, so a glow is a radial gradient between two alphas of the
 * accent rather than a blurred shape. `withAlpha` is the only thing in this
 * file that writes any part of a colour, and it only ever writes the alpha.
 */
import type { CSSProperties, ReactElement } from "react";
import { tokens } from "./tokens";
import type { Direction, MonogramShape, WordmarkCase, WordmarkTracking } from "./types";

/** Every card carries it. Lowercase on purpose: it is a signature, not a brand. */
export const OG_CREDIT = "built with ideawave";

export type OgCardInput = {
  /** The product's name, already resolved from APP_NAME or the brand. */
  name: string;
  tagline: string;
  /** Font family names from `loadOgFonts()`. */
  displayFamily: string;
  textFamily: string;
  /** Overridable so a future per-page card can say something else. */
  credit?: string;
};

const TRACKING: Record<WordmarkTracking, string> = {
  tight: "-0.03em",
  normal: "0em",
  wide: "0.06em",
};

function applyCase(value: string, mode: WordmarkCase): string {
  if (mode === "lower") return value.toLowerCase();
  if (mode === "upper") return value.toUpperCase();
  return value;
}

/**
 * A token colour at partial strength, as `#rrggbbaa`.
 *
 * Satori has no `color-mix` and no CSS variables, so a glow has to be a
 * gradient between two alphas of the same token. The colour still comes from
 * `tokens`; only the alpha is written here.
 */
function withAlpha(hex: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const channel = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${channel}`;
}

/** Radius for the three shapes a plain div can draw. Hexagon is drawn as SVG. */
function shapeRadius(shape: MonogramShape, size: number): number {
  if (shape === "circle") return size;
  if (shape === "rounded") return Math.round(size * 0.24);
  return 0;
}

export type OgMonogramProps = {
  size: number;
  background: string;
  color: string;
  fontFamily: string;
  /** Defaults to the brand's own letters and shape. */
  letters?: string;
  shape?: MonogramShape;
  border?: string;
  /** Glyph height as a fraction of `size`. Raise it for very small marks. */
  glyphScale?: number;
};

/**
 * The brand's monogram, drawn the way `brand.wordmark.monogram.shape` asks.
 * Shared by the four cards and by `src/app/icon.tsx`, so the tab icon and the
 * share card can never disagree about what the mark looks like.
 */
export function OgMonogram({
  size,
  background,
  color,
  fontFamily,
  letters = tokens.brand.wordmark.monogram.letters,
  shape = tokens.brand.wordmark.monogram.shape,
  border,
  glyphScale,
}: OgMonogramProps): ReactElement {
  const glyphSize = Math.round(size * (glyphScale ?? (letters.length > 1 ? 0.38 : 0.5)));
  const glyph: CSSProperties = {
    color,
    fontFamily,
    fontSize: glyphSize,
    fontWeight: tokens.brand.wordmark.weight,
    letterSpacing: "0.02em",
    lineHeight: 1,
  };

  if (shape === "hexagon") {
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <polygon points="50,1 93,25.5 93,74.5 50,99 7,74.5 7,25.5" fill={background} />
        </svg>
        <span style={glyph}>{letters}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
        borderRadius: shapeRadius(shape, size),
        ...(border ? { border } : {}),
        ...glyph,
      }}
    >
      {letters}
    </div>
  );
}

type CardContext = OgCardInput & {
  hex: (typeof tokens)["active"]["hex"];
  wordmark: string;
  credit: string;
};

function editorialCard(c: CardContext): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        backgroundColor: c.hex.canvas,
        fontFamily: c.textFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <OgMonogram
          size={58}
          background={c.hex.accent}
          color={c.hex["on-accent"]}
          fontFamily={c.displayFamily}
        />
        <span
          style={{
            color: c.hex.faint,
            fontSize: 19,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          {c.credit}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ width: "100%", height: 1, backgroundColor: c.hex.line, marginBottom: 40 }} />
        <span
          style={{
            color: c.hex.ink,
            fontFamily: c.displayFamily,
            fontSize: 112,
            lineHeight: 0.95,
            letterSpacing: TRACKING[tokens.brand.wordmark.tracking],
          }}
        >
          {c.wordmark}
        </span>
        <div style={{ width: 88, height: 5, backgroundColor: c.hex.accent, marginTop: 40 }} />
      </div>

      <span
        style={{
          color: c.hex.muted,
          fontSize: 30,
          lineHeight: 1.4,
          maxWidth: 880,
        }}
      >
        {c.tagline}
      </span>
    </div>
  );
}

function luminousCard(c: CardContext): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: c.hex.canvas,
        backgroundImage: [
          `radial-gradient(1200px 820px at 12% -16%, ${withAlpha(c.hex.accent, 0.34)} 0%, ${withAlpha(c.hex.accent, 0)} 62%)`,
          `radial-gradient(900px 640px at 94% 112%, ${withAlpha(c.hex.accent, 0.2)} 0%, ${withAlpha(c.hex.accent, 0)} 58%)`,
        ].join(", "),
        fontFamily: c.textFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 1004,
          padding: "60px 72px",
          borderRadius: 36,
          backgroundColor: c.hex.elevated,
          border: `1px solid ${withAlpha(c.hex.accent, 0.22)}`,
          boxShadow: `0 44px 120px -50px ${withAlpha(c.hex.accent, 0.55)}`,
        }}
      >
        <OgMonogram
          size={76}
          background={c.hex.accent}
          color={c.hex["on-accent"]}
          fontFamily={c.displayFamily}
        />
        <span
          style={{
            color: c.hex.ink,
            fontFamily: c.displayFamily,
            fontSize: 94,
            lineHeight: 1.05,
            letterSpacing: TRACKING[tokens.brand.wordmark.tracking],
            marginTop: 30,
            textAlign: "center",
          }}
        >
          {c.wordmark}
        </span>
        <span
          style={{
            color: c.hex.muted,
            fontSize: 27,
            lineHeight: 1.45,
            marginTop: 18,
            maxWidth: 780,
            textAlign: "center",
          }}
        >
          {c.tagline}
        </span>
        <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
          <div
            style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: c.hex.accent }}
          />
          <span
            style={{
              color: c.hex.faint,
              fontSize: 19,
              letterSpacing: "0.2em",
              marginLeft: 12,
              textTransform: "uppercase",
            }}
          >
            {c.credit}
          </span>
        </div>
      </div>
    </div>
  );
}

function brutalCard(c: CardContext): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 48,
        backgroundColor: c.hex.canvas,
        fontFamily: c.textFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <OgMonogram
          size={68}
          background={c.hex.accent}
          color={c.hex["on-accent"]}
          fontFamily={c.displayFamily}
          border={`4px solid ${c.hex.ink}`}
        />
        <span
          style={{
            color: c.hex.ink,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
          }}
        >
          {c.credit}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: 34,
          padding: "44px 48px",
          backgroundColor: c.hex.accent,
          border: `5px solid ${c.hex.ink}`,
          boxShadow: `16px 16px 0 0 ${c.hex.ink}`,
        }}
      >
        <span
          style={{
            color: c.hex["on-accent"],
            fontFamily: c.displayFamily,
            fontSize: 100,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
          }}
        >
          {c.wordmark.toUpperCase()}
        </span>
        <span
          style={{
            color: c.hex["on-accent"],
            fontSize: 27,
            lineHeight: 1.35,
            marginTop: 24,
            maxWidth: 900,
            opacity: 0.85,
          }}
        >
          {c.tagline}
        </span>
      </div>

      <div style={{ width: "100%", height: 16, backgroundColor: c.hex.ink, marginTop: 34 }} />
    </div>
  );
}

function craftCard(c: CardContext): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: 44,
        backgroundColor: c.hex.canvas,
        fontFamily: c.textFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 64,
          backgroundColor: c.hex.surface,
          border: `1px solid ${c.hex.line}`,
          borderRadius: 22,
          boxShadow: `0 26px 60px -30px ${withAlpha(c.hex.ink, 0.35)}`,
        }}
      >
        <OgMonogram
          size={66}
          background={c.hex.accent}
          color={c.hex["on-accent"]}
          fontFamily={c.displayFamily}
        />
        <span
          style={{
            color: c.hex.ink,
            fontFamily: c.displayFamily,
            fontSize: 90,
            lineHeight: 1.08,
            letterSpacing: TRACKING[tokens.brand.wordmark.tracking],
            marginTop: 32,
            textAlign: "center",
          }}
        >
          {c.wordmark}
        </span>
        <div style={{ width: 132, height: 2, backgroundColor: c.hex.accent, marginTop: 28 }} />
        <span
          style={{
            color: c.hex.muted,
            fontSize: 26,
            lineHeight: 1.55,
            marginTop: 28,
            maxWidth: 760,
            textAlign: "center",
          }}
        >
          {c.tagline}
        </span>
        <span
          style={{
            color: c.hex.faint,
            fontSize: 18,
            letterSpacing: "0.16em",
            marginTop: 44,
          }}
        >
          {c.credit}
        </span>
      </div>
    </div>
  );
}

function toContext(input: OgCardInput): CardContext {
  return {
    ...input,
    hex: tokens.active.hex,
    wordmark: applyCase(input.name, tokens.brand.wordmark.case),
    credit: input.credit ?? OG_CREDIT,
  };
}

/**
 * All four layouts, addressable by direction. `ogCard` picks this brand's one;
 * a preview or audit script can render the other three from the same process
 * to check that every layout still composes.
 */
export const OG_LAYOUTS: Record<Direction, (input: OgCardInput) => ReactElement> = {
  editorial: (input) => editorialCard(toContext(input)),
  luminous: (input) => luminousCard(toContext(input)),
  brutal: (input) => brutalCard(toContext(input)),
  craft: (input) => craftCard(toContext(input)),
};

/**
 * The card for this brand's direction, at `OG_SIZE`. One layout per direction,
 * chosen the same way the Hero section chooses its own.
 */
export function ogCard(input: OgCardInput): ReactElement {
  return OG_LAYOUTS[tokens.direction.key](input);
}
