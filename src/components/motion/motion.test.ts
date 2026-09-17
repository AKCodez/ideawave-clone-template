/**
 * The pure helpers behind the motion kit. Everything tested here is a plain
 * function on numbers or strings: the parts that decide how far something
 * travels, how long a marquee takes, and how many units of a headline animate.
 */

import { describe, expect, it } from "vitest";
import { clampParallax, MAX_PARALLAX_PX } from "./parallax";
import { ASSUMED_TRACK_PX, marqueeSeconds } from "./marquee";
import { cubicPoints, msToSeconds, stepCount, stepsEase, REVEAL_SETTLE_MS } from "./provider";
import { MAX_UNITS, splitUnits } from "./split-text";
import { magneticOffset } from "./magnetic";
import { tiltAngle } from "./tilt-card";

describe("cubicPoints", () => {
  it("reads the four control points of an easing token", () => {
    expect(cubicPoints("cubic-bezier(0.16, 1, 0.3, 1)")).toEqual([0.16, 1, 0.3, 1]);
  });

  it("returns null for anything that is not a cubic bezier", () => {
    expect(cubicPoints("steps(5, end)")).toBeNull();
    expect(cubicPoints("cubic-bezier(0.1, 0.2)")).toBeNull();
    expect(cubicPoints("linear")).toBeNull();
  });
});

describe("stepCount", () => {
  it("reads the rung count of a steps token", () => {
    expect(stepCount("steps(5, end)")).toBe(5);
    expect(stepCount("steps(3)")).toBe(3);
  });

  it("returns null for anything else", () => {
    expect(stepCount("cubic-bezier(0.16, 1, 0.3, 1)")).toBeNull();
  });
});

describe("stepsEase", () => {
  it("only ever lands on one of the rungs", () => {
    const ease = stepsEase(5);
    expect(ease(0)).toBe(0);
    expect(ease(0.19)).toBe(0);
    expect(ease(0.21)).toBeCloseTo(0.2);
    expect(ease(0.99)).toBeCloseTo(0.8);
    expect(ease(1)).toBe(1);
  });

  it("stays inside 0 to 1 whatever it is handed", () => {
    const ease = stepsEase(5);
    expect(ease(-2)).toBe(0);
    expect(ease(4)).toBe(1);
  });
});

describe("msToSeconds", () => {
  it("converts and never goes negative", () => {
    expect(msToSeconds(900)).toBe(0.9);
    expect(msToSeconds(0)).toBe(0);
    expect(msToSeconds(-500)).toBe(0);
  });
});

describe("clampParallax", () => {
  it("keeps travel inside the cap in both directions", () => {
    expect(clampParallax(32)).toBe(32);
    expect(clampParallax(500)).toBe(MAX_PARALLAX_PX);
    expect(clampParallax(-500)).toBe(-MAX_PARALLAX_PX);
  });

  it("treats a value that is not a number as no travel", () => {
    expect(clampParallax(Number.NaN)).toBe(0);
  });
});

describe("marqueeSeconds", () => {
  it("is width divided by px per second", () => {
    expect(marqueeSeconds(1200, 40)).toBe(30);
    expect(marqueeSeconds(1200, 90)).toBeCloseTo(13.33, 2);
  });

  it("falls back to the assumed width when nothing has been measured", () => {
    expect(marqueeSeconds(0, 40)).toBe(ASSUMED_TRACK_PX / 40);
  });
});

describe("splitUnits", () => {
  it("splits words and characters", () => {
    expect(splitUnits("ship the thing", "word")).toEqual(["ship", "the", "thing"]);
    expect(splitUnits("ab c", "char")).toEqual(["a", "b", " ", "c"]);
  });

  it("never animates more than the cap, and never loses text", () => {
    const words = Array.from({ length: 60 }, (_, index) => `w${index}`);
    const units = splitUnits(words.join(" "), "word");
    expect(units).toHaveLength(MAX_UNITS);
    expect(units.join(" ")).toBe(words.join(" "));
  });

  it("caps characters the same way", () => {
    const text = "x".repeat(100);
    const units = splitUnits(text, "char");
    expect(units).toHaveLength(MAX_UNITS);
    expect(units.join("")).toBe(text);
  });
});

describe("magneticOffset", () => {
  it("is zero at the centre and the full strength at the edge", () => {
    expect(magneticOffset(50, 0, 100, 10)).toBe(0);
    expect(magneticOffset(100, 0, 100, 10)).toBe(10);
    expect(magneticOffset(0, 0, 100, 10)).toBe(-10);
  });

  it("never exceeds the strength, however far outside the box the pointer is", () => {
    expect(magneticOffset(1000, 0, 100, 10)).toBe(10);
    expect(magneticOffset(-1000, 0, 100, 10)).toBe(-10);
  });

  it("is inert for a box with no size", () => {
    expect(magneticOffset(10, 0, 0, 10)).toBe(0);
  });
});

describe("tiltAngle", () => {
  it("turns from the centre out to the given degrees", () => {
    expect(tiltAngle(50, 0, 100, 6)).toBe(0);
    expect(tiltAngle(100, 0, 100, 6)).toBe(6);
    expect(tiltAngle(25, 0, 100, 6)).toBe(-3);
  });

  it("is flat when the direction sets no tilt", () => {
    expect(tiltAngle(100, 0, 100, 0)).toBe(0);
  });
});

describe("REVEAL_SETTLE_MS", () => {
  it("reveals every entrance on its own within a few seconds, so a capture or crawler that never scrolls still sees the page", () => {
    expect(REVEAL_SETTLE_MS).toBeGreaterThanOrEqual(1500);
    expect(REVEAL_SETTLE_MS).toBeLessThanOrEqual(4000);
  });
});
