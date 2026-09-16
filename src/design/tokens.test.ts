import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COLOR_TOKENS } from "./color";
import { PRESETS, PRESET_KEYS } from "./presets";
import { buildTokens, tokenContrastFailures } from "./tokens";
import { DIRECTIONS, SCHEMES } from "./types";

const css = readFileSync(join(process.cwd(), "src", "app", "brand.generated.css"), "utf8");

/**
 * Tailwind builds a utility name out of every theme key, so a key that happens
 * to be a CSS keyword silently overrides a core utility. `--spacing-block`
 * emitted `.inline-block { inline-size: ... }`, which beat Tailwind's own
 * `.inline-block { display: inline-block }` and collapsed every inline-block on
 * every page to 43px. Nothing errored; the headline just lost its letters.
 */
const RESERVED = [
  "block",
  "flex",
  "grid",
  "table",
  "inline",
  "contents",
  "flow-root",
  "list-item",
  "none",
  "auto",
  "full",
  "hidden",
  "visible",
];

describe("generated token names", () => {
  const keys = [...css.matchAll(/^\s*--(spacing|container|radius|shadow|text|font|ease|duration)-([a-z0-9-]+):/gim)].map(
    (match) => ({ namespace: match[1], key: match[2] }),
  );

  it("declares tokens in the namespaces the kit documents", () => {
    expect(keys.length).toBeGreaterThan(20);
  });

  it("never names a token after a CSS keyword that is already a utility", () => {
    const collisions = keys.filter((token) => RESERVED.includes(token.key ?? ""));
    expect(collisions).toEqual([]);
  });
});

describe("generated stylesheet", () => {
  it("resets Tailwind's own palette, fonts, radii and shadows", () => {
    for (const namespace of ["color", "font", "radius", "shadow"]) {
      expect(css).toContain(`--${namespace}-*: initial;`);
    }
  });

  it("defines all 17 colours in both schemes", () => {
    for (const scheme of SCHEMES) {
      const block = css.slice(css.indexOf(`html[data-scheme="${scheme}"]`));
      for (const token of COLOR_TOKENS) {
        expect(block.slice(0, block.indexOf("}"))).toContain(`--color-${token}:`);
      }
    }
  });

  it("matches the brand the repository currently ships", () => {
    expect(css).toContain("GENERATED FILE");
    expect(css).toContain("oklch(");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});

describe("every preset builds a shippable palette", () => {
  for (const key of PRESET_KEYS) {
    it(`${key} meets every contrast floor in both schemes`, () => {
      expect(tokenContrastFailures(buildTokens(PRESETS[key]))).toEqual([]);
    });
  }

  it("covers all four directions", () => {
    const covered = new Set(PRESET_KEYS.map((key) => PRESETS[key].direction));
    expect([...covered].sort()).toEqual([...DIRECTIONS].sort());
  });
});
