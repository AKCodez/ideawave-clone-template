import { describe, expect, it } from "vitest";
import {
  CONTRAST_FLOORS,
  buildRamp,
  clipToGamut,
  contrast,
  contrastFailures,
  css,
  hueDistance,
  inGamut,
  measureContrast,
  neutralAxis,
  oklchRamp,
  oklchToRgb,
  relativeLuminance,
  solveLightness,
  toHex,
} from "./color";
import { DIRECTION_SPECS } from "./directions";
import { DIRECTIONS, SCHEMES } from "./types";

const WHITE = { l: 1, c: 0, h: 0 };
const BLACK = { l: 0, c: 0, h: 0 };

describe("oklch to srgb", () => {
  it("maps the ends of the lightness axis to white and black", () => {
    const white = oklchToRgb(WHITE);
    expect(white.r).toBeCloseTo(1, 2);
    expect(white.g).toBeCloseTo(1, 2);
    expect(white.b).toBeCloseTo(1, 2);
    expect(toHex(WHITE)).toBe("#ffffff");
    expect(toHex(BLACK)).toBe("#000000");
  });

  it("matches a known conversion: oklch(0.628 0.2577 29.23) is sRGB red", () => {
    expect(toHex({ l: 0.6279, c: 0.2577, h: 29.23 })).toBe("#ff0000");
  });

  it("reports colours outside the cube as out of gamut", () => {
    expect(inGamut(oklchToRgb({ l: 0.75, c: 0.02, h: 210 }))).toBe(true);
    expect(inGamut(oklchToRgb({ l: 0.75, c: 0.4, h: 210 }))).toBe(false);
  });
});

describe("contrast", () => {
  it("is 21:1 between black and white and symmetric", () => {
    expect(contrast(WHITE, BLACK)).toBe(21);
    expect(contrast(BLACK, WHITE)).toBe(21);
    expect(contrast(WHITE, WHITE)).toBe(1);
  });

  it("uses WCAG relative luminance", () => {
    expect(relativeLuminance({ r: 1, g: 1, b: 1 })).toBeCloseTo(1, 4);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 6);
    expect(relativeLuminance({ r: 0, g: 1, b: 0 })).toBeCloseTo(0.7152, 3);
  });
});

describe("gamut clipping", () => {
  it("keeps lightness and hue, and only ever lowers chroma", () => {
    const wanted = { l: 0.72, c: 0.32, h: 145 };
    const clipped = clipToGamut(wanted);
    expect(clipped.l).toBe(wanted.l);
    expect(clipped.h).toBe(wanted.h);
    expect(clipped.c).toBeLessThan(wanted.c);
    expect(inGamut(oklchToRgb(clipped))).toBe(true);
  });

  it("leaves an in-gamut colour alone", () => {
    const fine = { l: 0.5, c: 0.05, h: 30 };
    expect(clipToGamut(fine)).toEqual(fine);
  });

  it("clips every hue at every lightness", () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        expect(inGamut(oklchToRgb(clipToGamut({ l, c: 0.4, h })))).toBe(true);
      }
    }
  });
});

describe("css serialisation", () => {
  it("writes oklch with and without alpha", () => {
    expect(css({ color: { l: 0.16, c: 0.012, h: 45 } })).toBe("oklch(0.16 0.012 45)");
    expect(css({ color: { l: 0.16, c: 0.012, h: 45 }, alpha: 0.72 })).toBe("oklch(0.16 0.012 45 / 0.72)");
  });
});

describe("hue distance", () => {
  it("takes the short way around the wheel", () => {
    expect(hueDistance(10, 350)).toBe(20);
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(0, 180)).toBe(180);
    expect(hueDistance(-10, 10)).toBe(20);
  });
});

describe("solveLightness", () => {
  it("walks lighter until it clears the floor on a dark background", () => {
    const solved = solveLightness({
      hue: 250,
      chroma: 0.12,
      against: { l: 0.15, c: 0.01, h: 250 },
      min: 4.5,
      start: 0.3,
      toward: "lighter",
    });
    expect(contrast(solved, { l: 0.15, c: 0.01, h: 250 })).toBeGreaterThanOrEqual(4.5);
  });

  it("walks darker on a light background", () => {
    const against = { l: 0.98, c: 0.005, h: 60 };
    const solved = solveLightness({ hue: 60, chroma: 0.14, against, min: 4.5, start: 0.8, toward: "darker" });
    expect(contrast(solved, against)).toBeGreaterThanOrEqual(4.5);
    expect(solved.l).toBeLessThan(0.8);
  });

  it("returns the best it found when the floor is unreachable", () => {
    const against = { l: 0.5, c: 0, h: 0 };
    const solved = solveLightness({ hue: 0, chroma: 0, against, min: 21, start: 0.5, toward: "lighter" });
    expect(contrast(solved, against)).toBeGreaterThan(1);
    expect(contrast(solved, against)).toBeLessThan(21);
  });
});

describe("neutral axis", () => {
  it("is warm, cool, or a faint echo of the accent", () => {
    expect(neutralAxis("warm", 200).hue).toBe(62);
    expect(neutralAxis("cool", 200).hue).toBe(258);
    expect(neutralAxis("neutral", 200)).toEqual({ hue: 200, chroma: 0.004 });
  });
});

describe("oklchRamp", () => {
  it("returns nine in-gamut swatches, lightest first", () => {
    const ramp = oklchRamp(280, 0.18);
    expect(ramp).toHaveLength(9);
    expect(ramp[0]!.l).toBeGreaterThan(ramp[8]!.l);
    for (const swatch of ramp) expect(inGamut(oklchToRgb(swatch))).toBe(true);
  });
});

describe("every direction meets the contrast floors", () => {
  const hues = [0, 25, 48, 90, 145, 180, 212, 250, 290, 320, 355];
  const chromas = [0.06, 0.12, 0.2, 0.3];

  for (const direction of DIRECTIONS) {
    for (const scheme of SCHEMES) {
      it(`${direction} / ${scheme} holds for every hue and chroma`, () => {
        const failures: string[] = [];
        for (const accentHue of hues) {
          for (const accentChroma of chromas) {
            for (const neutrals of ["warm", "cool", "neutral"] as const) {
              const ramp = buildRamp({
                scheme,
                recipe: DIRECTION_SPECS[direction].color,
                accentHue,
                accentChroma,
                neutrals,
              });
              for (const failure of contrastFailures(ramp)) {
                failures.push(`hue ${accentHue} chroma ${accentChroma} ${neutrals}: ${failure}`);
              }
            }
          }
        }
        expect(failures).toEqual([]);
      });
    }
  }

  it("reports the real numbers, not just a pass", () => {
    const ramp = buildRamp({
      scheme: "dark",
      recipe: DIRECTION_SPECS.editorial.color,
      accentHue: 48,
      accentChroma: 0.16,
      neutrals: "warm",
    });
    const report = measureContrast(ramp);
    expect(report.inkOnCanvas).toBeGreaterThanOrEqual(CONTRAST_FLOORS.inkOnCanvas);
    expect(report.mutedOnSurface).toBeGreaterThanOrEqual(CONTRAST_FLOORS.mutedOnSurface);
    expect(report.accentOnCanvas).toBeGreaterThanOrEqual(CONTRAST_FLOORS.accentOnCanvas);
    expect(report.onAccentOnAccent).toBeGreaterThanOrEqual(CONTRAST_FLOORS.onAccentOnAccent);
  });
});
