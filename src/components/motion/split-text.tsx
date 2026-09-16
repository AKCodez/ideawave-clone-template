"use client";

/**
 * SplitText: a headline that arrives one word (or one letter) at a time.
 *
 * Direction behaviour it carries: editorial most of all, where each word wipes
 * up from behind its own mask, which is the direction's signature move; brutal
 * snaps its words in five steps, luminous springs them, craft rises them
 * quietly.
 *
 * Accessibility is the constraint that shapes the markup: the animated units
 * are aria-hidden and unselectable, and the whole string is rendered once in an
 * sr-only element, so a screen reader and a copy both get one sentence rather
 * than forty fragments. At most 40 units ever animate; the rest of a long
 * string rides along on the last one.
 */

import { m, useReducedMotion, type Variants } from "motion/react";
import { Fragment, type ReactElement } from "react";
import { tokens } from "@/design/tokens";
import { REVEAL_AMOUNT, durations, msToSeconds, revealDistance, revealTransition } from "./provider";
import { revealVariants, type RevealTag, type RevealVariant } from "./reveal";

/** Never animate more units than this, however long the string is. */
export const MAX_UNITS = 40;

const DEFAULT_VARIANT: Record<typeof tokens.motion.enter, RevealVariant> = {
  mask: "mask",
  blur: "blur",
  step: "rise",
  fade: "rise",
};

/** Milliseconds between one unit and the next: a third of the snap step. */
const UNIT_GAP_MS = Math.round(durations[0] / 3);

/** A no-break space, so a space of its own still occupies an inline-block. */
const NBSP = String.fromCharCode(160);

/**
 * Split a string into the units that will animate, capped at `max`. Everything
 * past the cap is folded into the last unit, so no character is ever lost.
 */
export function splitUnits(text: string, by: "word" | "char", max: number = MAX_UNITS): string[] {
  const raw = by === "word" ? text.split(/\s+/).filter(Boolean) : Array.from(text);
  if (raw.length <= max) return raw;
  const head = raw.slice(0, max - 1);
  const tail = raw.slice(max - 1).join(by === "word" ? " " : "");
  return [...head, tail];
}

export type SplitTextProps = {
  text: string;
  by?: "word" | "char";
  as?: RevealTag;
  className?: string;
  /** Milliseconds before the first unit moves. */
  delay?: number;
};

export function SplitText({
  text,
  by = "word",
  as = "span",
  className,
  delay = 0,
}: SplitTextProps): ReactElement {
  const reduced = useReducedMotion() ?? false;
  const Tag = as;
  const variant = DEFAULT_VARIANT[tokens.motion.enter];
  const units = splitUnits(text, by);
  const unitVariants: Variants = revealVariants(variant, revealDistance);
  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: msToSeconds(delay),
        staggerChildren: msToSeconds(reduced ? 0 : UNIT_GAP_MS),
      },
    },
  };

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <m.span
        aria-hidden="true"
        className="select-none"
        variants={parentVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: REVEAL_AMOUNT }}
      >
        {units.map((unit, index) => (
          <Fragment key={`${index}-${unit}`}>
            {by === "word" && index > 0 ? " " : null}
            {/* text-wrap: balance is inherited from the heading, and an
                inline-block that balances its own single word shrinks to a
                fraction of that word's width - which overflow: hidden then
                clips. Every unit and its mask opt out explicitly. */}
            <span
              className="inline-block overflow-hidden"
              style={{
                paddingBottom: "0.14em",
                marginBottom: "-0.14em",
                textWrap: "nowrap",
              }}
            >
              <m.span
                data-split-unit={variant}
                className="inline-block"
                style={{ textWrap: "nowrap" }}
                variants={unitVariants}
                transition={revealTransition(reduced)}
              >
                {unit.trim() === "" ? NBSP : unit}
              </m.span>
            </span>
          </Fragment>
        ))}
      </m.span>
    </Tag>
  );
}
