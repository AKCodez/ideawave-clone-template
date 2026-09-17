import type { ReactElement, ReactNode } from "react";
import { clsx } from "clsx";
import { tokens } from "@/design/tokens";

/**
 * The composition's hero layout, read through tokens.brand like every other
 * brand field a component branches on. Lives here, not in hero.tsx, because
 * the four direction heroes import this file and hero.tsx imports them.
 */
export const heroLayout = tokens.brand.composition.hero;

/**
 * One layout skeleton the four direction heroes share, so a layout is a real
 * change of composition and not a re-skin: where the copy block, the actions
 * and the product frame sit relative to each other.
 *
 *   stage  - copy centred, frame below at full width
 *   split  - copy left, frame right (stacks on a phone)
 *   ledger - copy full width, a rule, then the frame as a wide band
 *
 * The direction files pass the pieces in and keep their own ornament (aurora,
 * marquee, masthead rule, drawn underline) around this.
 */
export function HeroLayout({
  copy,
  frame,
  rule,
}: {
  copy: ReactNode;
  frame?: ReactNode;
  /** The direction's rule class for the ledger's divider. */
  rule?: string;
}): ReactElement {
  if (heroLayout === "split") {
    return (
      <div className="grid gap-stack lg:grid-cols-12 lg:items-center">
        <div className="flex flex-col gap-6 lg:col-span-5">{copy}</div>
        {frame ? <div className="min-w-0 lg:col-span-7">{frame}</div> : null}
      </div>
    );
  }
  if (heroLayout === "ledger") {
    return (
      <div className="flex flex-col gap-stack">
        <div className="flex flex-col gap-6">{copy}</div>
        {frame ? (
          <div className={clsx("min-w-0 border-t pt-stack", rule ?? "border-line")}>{frame}</div>
        ) : null}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-stack">
      <div className="flex flex-col items-center gap-6 text-center">{copy}</div>
      {frame ? <div className="min-w-0">{frame}</div> : null}
    </div>
  );
}

/** The copy column's alignment classes for the current layout. */
export const heroAlign = heroLayout === "stage" ? "items-center text-center" : "items-start text-left";
