"use client";

/**
 * Stagger: a list whose items enter one after another instead of together.
 *
 * Direction behaviour it carries: all four, through the shared entrance. Items
 * use the direction's own variant and easing, and the gap between them defaults
 * to `--duration-1`, which is the direction's snap step (140ms editorial,
 * 80ms brutal), so a brutal grid lands like a drum roll and an editorial one
 * unfolds.
 *
 * Stagger.Item must sit inside a Stagger: the "visible" label reaches it
 * through context, so plain wrappers in between are fine, but another animated
 * element that sets its own initial or animate becomes a new root and takes
 * the items under it out of the cascade.
 */

import { m, useReducedMotion, type Variants } from "motion/react";
import type { ReactElement, ReactNode } from "react";
import { tokens } from "@/design/tokens";
import { durations, msToSeconds, revealDistance, revealTransition } from "./provider";
import { revealVariants, type RevealTag, type RevealVariant } from "./reveal";

const DEFAULT_VARIANT: Record<typeof tokens.motion.enter, RevealVariant> = {
  mask: "mask",
  blur: "blur",
  step: "rise",
  fade: "rise",
};

const DEFAULT_AMOUNT = 0.2;

export type StaggerProps = {
  children: ReactNode;
  /** Milliseconds between one item and the next. Defaults to `--duration-1`. */
  gap?: number;
  className?: string;
  as?: RevealTag;
};

export type StaggerItemProps = {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
  as?: RevealTag;
};

function StaggerRoot({ children, gap = durations[0], className, as = "div" }: StaggerProps): ReactElement {
  const reduced = useReducedMotion() ?? false;
  const Tag = m[as] as typeof m.div;
  const variants: Variants = {
    hidden: {},
    // Reduced motion removes the cascade as well as the movement: every item
    // is simply already where it belongs.
    visible: { transition: { staggerChildren: msToSeconds(reduced ? 0 : gap) } },
  };

  return (
    <Tag
      data-stagger=""
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: DEFAULT_AMOUNT }}
    >
      {children}
    </Tag>
  );
}

function StaggerItem({
  children,
  variant = DEFAULT_VARIANT[tokens.motion.enter],
  className,
  as = "div",
}: StaggerItemProps): ReactElement {
  const reduced = useReducedMotion() ?? false;
  const Tag = m[as] as typeof m.div;

  return (
    <Tag
      data-stagger-item={variant}
      className={className}
      variants={revealVariants(variant, revealDistance)}
      transition={revealTransition(reduced)}
    >
      {children}
    </Tag>
  );
}

type StaggerComponent = ((props: StaggerProps) => ReactElement) & {
  Item: (props: StaggerItemProps) => ReactElement;
};

export const Stagger: StaggerComponent = Object.assign(StaggerRoot, { Item: StaggerItem });
