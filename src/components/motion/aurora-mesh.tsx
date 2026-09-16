/**
 * AuroraMesh: the accent light behind a hero.
 *
 * Direction behaviour it carries: luminous drifts two accent clouds on a 24
 * second loop, which is the direction's signature backdrop; editorial and craft
 * keep the same clouds but hold them still, so the page stays a magazine or a
 * book; brutal swaps the clouds for hard-edged accent blocks, because a poster
 * does not glow.
 *
 * It is decorative: aria-hidden, never takes a pointer event, clipped to its
 * own box so it cannot widen the page at 390px, and animated on transform
 * alone. Place it inside a container that establishes a positioning context.
 */

import type { ReactElement } from "react";
import { tokens } from "@/design/tokens";
import type { Direction } from "@/design/types";
import type { CssVars } from "./provider";

const key: Direction = tokens.direction.key;

/** Only the keynote direction moves. */
const drifts = key === "luminous";

/** How loudly the light reads, per direction. */
const OPACITY: Record<Direction, [number, number]> = {
  editorial: [0.16, 0.12],
  luminous: [0.42, 0.3],
  brutal: [0.5, 0.35],
  craft: [0.22, 0.16],
};

function wash(color: string): string {
  return key === "brutal" ? color : `radial-gradient(closest-side, ${color}, transparent)`;
}

export type AuroraMeshProps = { className?: string };

export function AuroraMesh({ className }: AuroraMeshProps): ReactElement {
  const [alphaA, alphaB] = OPACITY[key];

  const layerA: CssVars = {
    insetInlineStart: "-12%",
    insetBlockStart: "-20%",
    inlineSize: "62%",
    maxInlineSize: "100%",
    aspectRatio: "1 / 1",
    opacity: alphaA,
    background: wash("var(--color-accent)"),
  };

  const layerB: CssVars = {
    insetInlineStart: "44%",
    insetBlockStart: "18%",
    inlineSize: "58%",
    maxInlineSize: "100%",
    aspectRatio: "1 / 1",
    opacity: alphaB,
    background: wash("var(--color-accent-soft)"),
  };

  return (
    <div
      data-aurora=""
      data-aurora-drift={drifts ? "true" : "false"}
      aria-hidden="true"
      className={className}
    >
      <div data-aurora-layer="a" style={layerA} />
      <div data-aurora-layer="b" style={layerB} />
    </div>
  );
}
