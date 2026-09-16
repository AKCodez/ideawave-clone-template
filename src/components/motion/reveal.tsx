"use client";

/**
 * Reveal: the entrance every section is wrapped in.
 *
 * Direction behaviour it carries: all four, and it is where they are easiest to
 * tell apart. Editorial wipes a mask 32px over 900ms on an expo curve, luminous
 * springs up with a scale overshoot, brutal rises 16px in five visible steps
 * over 320ms, craft fades and rises 20px over 800ms.
 *
 * The hidden frame is identical on the server and on the client, so reduced
 * motion never causes a hydration mismatch: it changes the transition, not the
 * markup, and `motion.css` holds the element at its final frame regardless.
 */

import { m, useReducedMotion, type Variants } from "motion/react";
import type { ReactElement, ReactNode } from "react";
import { tokens } from "@/design/tokens";
import { OVERSHOOT_FROM, REVEAL_AMOUNT, revealDistance, revealTransition } from "./provider";

export type RevealVariant = "fade" | "rise" | "mask" | "blur";

/** The tags a reveal may render as. Anything else belongs in its own section. */
export type RevealTag =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "figure"
  | "span"
  | "p"
  | "li"
  | "ul"
  | "ol"
  | "h1"
  | "h2"
  | "h3";

/**
 * The direction's own entrance. `step` is brutal's snap, which is a rise with a
 * stepped easing rather than a shape of its own, and `fade` is craft's plain
 * entrance, which the kit spells as a fade and a rise together.
 */
const DEFAULT_VARIANT: Record<typeof tokens.motion.enter, RevealVariant> = {
  mask: "mask",
  blur: "blur",
  step: "rise",
  fade: "rise",
};



export function revealVariants(variant: RevealVariant, distance: number): Variants {
  switch (variant) {
    case "mask":
      return {
        hidden: { opacity: 0, y: distance, clipPath: "inset(0% 0% 100% 0%)" },
        visible: { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
      };
    case "blur":
      return {
        hidden: { opacity: 0, y: distance, scale: OVERSHOOT_FROM },
        visible: { opacity: 1, y: 0, scale: 1 },
      };
    case "rise":
      return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } };
    case "fade":
      return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  }
}

export type RevealProps = {
  children: ReactNode;
  as?: RevealTag;
  variant?: RevealVariant;
  /** Milliseconds to wait after the element enters the viewport. */
  delay?: number;
  once?: boolean;
  /** Fraction of the element that must be visible, 0 to 1. */
  amount?: number;
  className?: string;
};

export function Reveal({
  children,
  as = "div",
  variant = DEFAULT_VARIANT[tokens.motion.enter],
  delay = 0,
  once = true,
  amount = REVEAL_AMOUNT,
  className,
}: RevealProps): ReactElement {
  const reduced = useReducedMotion() ?? false;
  const Tag = m[as] as typeof m.div;
  /* A mask hides the element by clipping it to nothing, and a clipped element
     reports an intersection ratio of 0 forever - so any threshold above 0 is a
     deadlock. See REVEAL_AMOUNT in ./provider. */
  const safeAmount = variant === "mask" ? 0 : amount;

  return (
    <Tag
      data-reveal={variant}
      className={className}
      variants={revealVariants(variant, revealDistance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: safeAmount }}
      transition={revealTransition(reduced, delay)}
    >
      {children}
    </Tag>
  );
}
